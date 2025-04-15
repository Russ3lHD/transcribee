import { useMemo, useState, useEffect } from 'react';
import * as Automerge from '@automerge/automerge';

import { Checkbox } from '../../components/form';
import { downloadBinaryAsFile } from '../../utils/download_text_as_file';
import { ExportProps } from '.';
import { HttpReader, Uint8ArrayReader, ZipWriter, Uint8ArrayWriter } from '@zip.js/zip.js';
import { sortMediaFiles } from '../../utils/use_audio';
import { LoadingSpinnerButton, SecondaryButton } from '../../components/button';
import { useTimecodeOffset } from '../../utils/document';

export function TranscribeeExportBody({
  onClose,
  outputNameBase,
  editor,
  document,
}: ExportProps) {
  const [loading, setLoading] = useState(false);
  const [includeOriginalMediaFile, setIncludeOriginalMediaFile] = useState(false);
  const [offset, setOffset] = useTimecodeOffset(editor);
  const [localTimecode, setLocalTimecode] = useState(offset || '00:00:00:00');

  useEffect(() => {
    if (offset) {
      setLocalTimecode(offset);
    }
  }, [offset]);

  const bestMediaUrl = useMemo(() => {
    const mappedFiles =
      document?.media_files.map((media) => {
        return {
          src: media.url,
          type: media.content_type,
        };
      }) || [];

    return sortMediaFiles(mappedFiles)[0].src;
  }, [document?.media_files]);

  const originalMediaUrl = useMemo(() => {
    for (const media_file of document?.media_files || []) {
      if (media_file.tags.includes('original')) {
        return media_file.url;
      }
    }
  }, [document?.media_files]);

  const applyTimecodeOffset = (seconds: number, timecode: string) => {
    const [hours, minutes, secs, frames] = timecode.split(':').map(Number);
    const offsetInSeconds = hours * 3600 + minutes * 60 + secs + frames / 30; // Assuming 30 fps
    return seconds + offsetInSeconds;
  };

  return (
    <form className="flex flex-col gap-4 mt-4">
      <Checkbox
        label="Export original media file"
        value={includeOriginalMediaFile}
        onChange={(x) => setIncludeOriginalMediaFile(x)}
      />
      {includeOriginalMediaFile && (
        <div className="block bg-yellow-100 px-2 py-2 rounded text-center text-yellow-700">
          <strong>Warning:</strong> Exporting the original media file can lead to much larger
          archives as well as long loading times.
        </div>
      )}
      <div className="flex justify-between pt-4">
        <SecondaryButton type="button" onClick={onClose}>
          Cancel
        </SecondaryButton>
        <LoadingSpinnerButton
          type="submit"
          onClick={async (e) => {
            e.preventDefault();
            setLoading(true);
            try {
              const adjustedDoc = Automerge.change(editor.doc, (doc) => {
                doc.children.forEach((para) => {
                  para.children.forEach((child) => {
                    if (child.start !== undefined) {
                      child.start = applyTimecodeOffset(child.start, localTimecode);
                    }
                    if (child.end !== undefined) {
                      child.end = applyTimecodeOffset(child.end, localTimecode);
                    }
                  });
                });
              });
              const mediaUrl =
                includeOriginalMediaFile && originalMediaUrl ? originalMediaUrl : bestMediaUrl;
              const zipFileWriter = new Uint8ArrayWriter();
              const zipWriter = new ZipWriter(zipFileWriter, { level: 0 });
              const doc = new Uint8ArrayReader(Automerge.save(adjustedDoc));
              await Promise.all([
                zipWriter.add('document.automerge', doc),
                zipWriter.add('media', new HttpReader(mediaUrl, { preventHeadRequest: true })),
              ]);

              await zipWriter.close();
              const zipFileBlob = await zipFileWriter.getData();
              downloadBinaryAsFile(
                `${outputNameBase}.transcribee`,
                `application/octet-stream`,
                zipFileBlob,
              );

              onClose();
            } catch (e) {
              console.error('Error while exporting', e);
            }
            setLoading(false);
          }}
          variant="primary"
          loading={loading}
        >
          Export
        </LoadingSpinnerButton>
      </div>
    </form>
  );
}
