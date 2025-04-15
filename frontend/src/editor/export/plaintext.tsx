import { useState, useEffect } from 'react';
import * as Automerge from '@automerge/automerge';

import { Checkbox } from '../../components/form';
import { downloadTextAsFile } from '../../utils/download_text_as_file';
import { ExportProps } from '.';
import { PrimaryButton, SecondaryButton } from '../../components/button';
import { generatePlaintext } from '../../utils/export/plaintext';
import { useTimecodeOffset } from '../../utils/document';

export function PlaintextExportBody({
  onClose,
  outputNameBase,
  editor,
}: ExportProps) {
  const [includeSpeakerNames, setIncludeSpeakerNames] = useState(true);
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [offset, setOffset] = useTimecodeOffset(editor);
  const [localTimecode, setLocalTimecode] = useState(offset || '00:00:00:00');

  useEffect(() => {
    if (offset) {
      setLocalTimecode(offset);
    }
  }, [offset]);

  const applyTimecodeOffset = (seconds: number): number => {
    const [hours, minutes, secs, frames] = localTimecode.split(':').map(Number);
    const offsetInSeconds = hours * 3600 + minutes * 60 + secs + frames / 25; // Assuming 25 fps
    return seconds + offsetInSeconds;
  };

  return (
    <form className="flex flex-col gap-4 mt-4">
      <Checkbox
        label="Include Speaker Names"
        value={includeSpeakerNames}
        onChange={(x) => setIncludeSpeakerNames(x)}
      />
      <Checkbox
        label="Include Timestamps"
        value={includeTimestamps}
        onChange={(x) => setIncludeTimestamps(x)}
      />
      <div className="flex justify-between pt-4">
        <SecondaryButton type="button" onClick={onClose}>
          Cancel
        </SecondaryButton>
        <PrimaryButton
          type="submit"
          onClick={async (e) => {
            e.preventDefault();
            const plaintext = generatePlaintext(
              Automerge.toJS(editor.doc),
              includeSpeakerNames,
              includeTimestamps,
              (start) => applyTimecodeOffset(start)
            );
            downloadTextAsFile(`${outputNameBase}.txt`, `text/plain`, plaintext);
            onClose();
          }}
        >
          Export
        </PrimaryButton>
      </div>
    </form>
  );
}
