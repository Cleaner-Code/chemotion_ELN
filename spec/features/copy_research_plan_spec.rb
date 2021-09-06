# frozen_string_literal: true

require 'rails_helper'

describe 'Copy research plans' do
  let!(:user1) { create(:user, first_name: 'Hallo', last_name: 'Complat', account_active: true, confirmed_at: Time.now) }
  let!(:user2) { create(:user, first_name: 'User2', last_name: 'Complat', account_active: true, confirmed_at: Time.now) }
  let(:rp1) { create(:research_plan, creator: user1, name: 'RP 1', body: []) }
  let!(:col1) { create(:collection, user_id: user1.id, label: 'Col1') }

  let(:rp2) { create(:research_plan, creator: user1, name: 'RP 2', body: []) }
  let!(:root_share) { create(:collection, user: user1, shared_by_id: user2.id, is_shared: true, is_locked: true) }
  let!(:cshare) { create(:collection, user: user1, label: 'share-col', permission_level: 10, shared_by_id: user2.id, is_shared: true, ancestry: root_share.id.to_s) }

  before do
    sign_in(user1)
    fp = Rails.public_path.join('images', 'molecules', 'molecule.svg')
    svg_path = Rails.root.join('spec', 'fixtures', 'images', 'molecule.svg')
    `ln -s #{svg_path} #{fp} ` unless File.exist?(fp)
    CollectionsResearchPlan.find_or_create_by!(research_plan: rp1, collection: col1)
    CollectionsResearchPlan.find_or_create_by!(research_plan: rp2, collection: cshare)
  end

  it ' new research plan', js: true do
    find_by_id('tree-id-Col1').click
    first('i.icon-research_plan').click
    expect(page).not_to have_button('copy-element-btn', wait: 5)
  end

  it 'to same collection', js: true do
    find_by_id('tree-id-Col1').click
    first('i.icon-research_plan').click
    find_by_id('tree-id-Col1').click
    expect(page).to have_content('RP 1')
    find('div.preview-table').click
    first('i.fa-clone').click
    find_by_id('submit-copy-element-btn').click
    find_field('research_plan_name').set('RP copy').send_keys(:enter)
    find(:xpath, '//*[@id="elements-tabs-pane-1"]/div/div[2]/div[2]/button[2]').click # orange create btn
    expect(page).to have_content('RP copy', wait: 5)
  end

  it 'to diff collection', js: true do
    find_by_id('tree-id-Col1').click
    first('i.icon-research_plan').click
    find_by_id('tree-id-Col1').click
    expect(page).to have_content('RP 1')
    find('div.preview-table').click
    first('i.fa-clone').click
    # to diff col:
    find_field('modal-collection-id-select').set('Col2').send_keys(:enter)
    find_by_id('submit-copy-element-btn').click
    find_field('research_plan_name').set('RP copy').send_keys(:enter)
    find(:xpath, '//*[@id="elements-tabs-pane-1"]/div/div[2]/div[2]/button[2]').click # orange create btn
    expect(page).to have_content('RP copy', wait: 5)
  end

  it 'to shared collection with permission', js: true do
    find_by_id('shared-home-link').click
    find_all('span.glyphicon-plus')[0].click
    find_by_id('tree-id-share-col').click
    first('i.icon-research_plan').click
    expect(page).to have_content('RP 2', wait: 5)
    find('div.preview-table').click
    first('i.fa-clone').click
    find_field('modal-collection-id-select').set('Col1').send_keys(:enter)
    find_by_id('submit-copy-element-btn').click
    find(:xpath, '//*[@id="elements-tabs-pane-1"]/div/div[2]/div[2]/button[2]').click # orange create btn
    find('.tree-view', text: 'Col1').click
    first('i.icon-research_plan').click
    expect(page).to have_content('RP 2', wait: 5)
  end
end
