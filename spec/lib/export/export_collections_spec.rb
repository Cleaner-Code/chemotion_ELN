# frozen_string_literal: true

require 'rails_helper'

# test for ExportJson ImportJson
RSpec.describe 'ExportCollection' do
  let(:user) { create(:person, first_name: 'Ulf', last_name: 'User', name_abbreviation: 'UU') }

  let(:collection) { create(:collection, user_id: user.id, label: 'Awesome Collection') }

  let(:molfile) { Rails.root.join('spec/fixtures/test_2.mol').read }
  let(:svg) { Rails.root.join('spec/fixtures/images/molecule.svg').read }
  let(:sample) { build(:sample, created_by: user.id, name: 'Sample zero', molfile: molfile, collections: [collection]) }
  let(:molecule_name_name) { 'Awesome Molecule' }
  let(:molecule_name) do
    build(:molecule_name, user_id: user.id, name: molecule_name_name, molecule_id: sample.molecule_id)
  end
  let(:job_id) { SecureRandom.uuid }

  context 'with a sample' do
    before do
      export = Export::ExportCollections.new(job_id, [collection.id], 'zip', true)
      export.prepare_data
      export.to_file
    end

    it 'exported file exists' do
      file_path = File.join('public', 'zip', "#{job_id}.zip")
      expect(File.exist?(file_path)).to be true
    end

    it 'zip file containing export.json, schema.json and description.txt' do
      file_names = []
      file_path = File.join('public', 'zip', "#{job_id}.zip")
      Zip::File.open(file_path) do |files|
        files.each do |file|
          file_names << file.name
        end
      end
      expect(file_names).to include('export.json', 'schema.json', 'description.txt')
    end
  end

  context 'with a researchplan' do
    let(:collection) { create(:collection, user_id: user.id, label: 'collection-with-rp') }
    let(:research_plan) { create(:research_plan, collections: [collection]) }

    let(:attachment) do
      create(:attachment,
             bucket: 1,
             filename: 'upload.png',
             created_by: 1,
             attachable_id: research_plan.id,
             attachment_data: create_annotation_json(tempfile.path))
    end

    let(:tempfile) do
      example_svg_annotation = '<svg>example</svg>'
      tempfile = Tempfile.new('annotationFile.svg')
      tempfile.write(example_svg_annotation)
      tempfile.rewind
      tempfile.close
      tempfile
    end

    before do
      research_plan.attachments = [attachment]
      research_plan.save!
      update_body_of_researchplan(research_plan, attachment.identifier)

      export = Export::ExportCollections.new(job_id, [collection.id], 'zip', true)
      export.prepare_data
      export.to_file
    end

    it 'exported file exists' do
      file_path = File.join('public', 'zip', "#{job_id}.zip")
      expect(File.exist?(file_path)).to be true
    end
  end

  def update_body_of_researchplan(research_plan, identifier_of_attachment)
    research_plan.body = [
      {
        id: 'entry-003',
        type: 'image',
        value: {
          file_name: 'xyz.png',
          public_name: identifier_of_attachment,
        },
      },
    ]
    research_plan.save!
    research_plan
  end

  def create_annotation_json(location)
    tempfile = Tempfile.new('example.png')
    str = '{' \
          '"id": "' + tempfile.path + '",' \
                                      '"storage": "store",' \
                                      '"metadata": {' \
                                      '"size": 29111,' \
                                      '"filename": "example.png",' \
                                      '"mime_type": null' \
                                      '},' \
                                      '"derivatives": {' \
                                      '"annotation": {' \
                                      '"id": "' + location + '",' \
                                                             '"storage": "store",' \
                                                             '"metadata": {' \
                                                             '"size": 480,' \
                                                             '"filename": "example_annotation.svg",' \
                                                             '"mime_type": null' \
                                                             '}}}}'
    JSON.parse(str)
  end
end
