import { useState } from 'react';

import { FormControl, Select } from '../../components/form';
import { downloadTextAsFile } from '../../utils/download_text_as_file';
import { ExportProps } from '.';
import { PrimaryButton, SecondaryButton } from '../../components/button';
import { useTimecodeOffset } from '../../utils/document';

export function AvidMarkerFileExportBody({
  onClose,
  outputNameBase,
  editor,
}: Omit<ExportProps, 'startTimecode'>) {
  const [framerate, setFramerate] = useState(25);
  const [offset] = useTimecodeOffset(editor);

  const exportAvidMarkerFile = () => {
    const transcript = editor.doc.children;
    const lines = transcript.map((para) => {
      const baseTime = para.children[0].start || 0;
      const adjustedTime = applyTimecodeOffset(baseTime, offset || '00:00:00:00');
      const timecode = formatTimecode(adjustedTime, framerate);
      return `${timecode}\t${para.children.map((x) => x.text).join('')}`;
    });

    const content = `Avid Locator File\n\n${lines.join('\n')}`;
    downloadTextAsFile(`${outputNameBase}.txt`, 'text/plain', content);
    onClose();
  };

  const applyTimecodeOffset = (seconds: number, timecode: string) => {
    const [hours, minutes, secs, frames] = timecode.split(':').map(Number);
    const offsetInSeconds = hours * 3600 + minutes * 60 + secs + frames / framerate;
    return seconds + offsetInSeconds;
  };

  const formatTimecode = (seconds: number, fps: number) => {
    const totalFrames = Math.floor(seconds * fps);
    const frames = totalFrames % fps;
    const totalSeconds = Math.floor(totalFrames / fps);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
  };

  return (
    <form className="flex flex-col gap-4 mt-4">
      <FormControl label="Framerate">
        <Select
          value={framerate}
          onChange={(e) => setFramerate(parseInt(e.target.value))}
        >
          {[24, 25, 30].map((fps) => (
            <option key={fps} value={fps}>
              {fps} fps
            </option>
          ))}
        </Select>
      </FormControl>
      <div className="flex justify-between pt-4">
        <SecondaryButton type="button" onClick={onClose}>
          Cancel
        </SecondaryButton>
        <PrimaryButton type="button" onClick={exportAvidMarkerFile}>
          Export
        </PrimaryButton>
      </div>
    </form>
  );
}
