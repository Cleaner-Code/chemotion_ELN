# frozen_string_literal: true

require 'helpers/annotation/annotation_updater'
require_relative 'annotation_helper'

describe AnnotationUpdater do
  describe '.update annotation' do
    update_process { described_class.new.update_annotation('', attachment_id) }

    context 'when attachment does not exist' do
      let(:attachment_id) { -1 }

      it 'raises an error' do
        expect { update_process }.to raise_error "Couldn't find Attachment with 'id'=#{attachment_id}"
      end
    end

    context 'when attachment does exist' do
      context 'when annotation is valide' do # rubocop disable: RSpec/NestedGroups
        it '-> success' do
          helper = AnnotationHelper.new
          example_svg_annotation = '<svg>example <image height="100" id="original_image" width="100" xlink:href="something"</svg>'
          tempfile = Tempfile.new('annotationFile.svg')
          tempfile.write(example_svg_annotation)
          tempfile.rewind
          tempfile.close
          attachment = helper.createAttachmentWithAnnotation(tempfile.path)
          attachment.attachment_data['derivatives']['thumbnail'] =
            attachment.attachment_data['derivatives']['annotation']
          attachment.attachment_data['derivatives']['thumbnail']['id'] =
            attachment.attachment_data['derivatives']['thumbnail']['id'] + '_thumbnail'
          attachment.save
          updater = described_class.new(ThumbnailerMock.new)
          updater.update_annotation(
            '<svg>edited example <image height="100" id="original_image" width="100" href="something"</svg>', attachment.id
          )

          file = File.open(attachment.attachment_data['derivatives']['annotation']['id'])
          data = file.read
          assert_equal(
            "<?xml version=\"1.0\"?>\n<svg>edited example <image height=\"100\" id=\"original_image\" width=\"100\" href=\"data:image/png;base64,\"/></svg>\n", data
          )

          tempfile.unlink
        end
      end
    end
  end
end

class ThumbnailerMock
  def create_thumbnail(tmp_path)
    tmp_path
  end
end
