import { formattedTime } from '../../editor/transcription_editor';
import { Document } from '../../editor/types';
import { getSpeakerName } from '../document';

export function generatePlaintext(
  doc: Document,
  includeSpeakerNames: boolean,
  includeTimestamps: boolean,
  applyTimecodeOffset?: (seconds: number) => number,
): string {
  let last_speaker: string | null = null;
  return doc.children
    .map((paragraph) => {
      let paragraphText = '';
      if (
        last_speaker !== null &&
        ((includeSpeakerNames && last_speaker !== paragraph.speaker) ||
          (includeTimestamps && !includeSpeakerNames))
      ) {
        paragraphText += '\n';
      }
      if (includeTimestamps && (last_speaker !== paragraph.speaker || !includeSpeakerNames)) {
        const timestamp = paragraph.children[0].start;
        const adjustedTime = timestamp !== undefined && applyTimecodeOffset
          ? applyTimecodeOffset(timestamp)
          : timestamp;
        paragraphText += `[${formattedTime(adjustedTime)}]\n`;
      }
      if (includeSpeakerNames && last_speaker !== paragraph.speaker) {
        paragraphText += `${getSpeakerName(paragraph.speaker, doc.speaker_names)}:\n`;
      }

      paragraphText += paragraph.children
        .map((x) => x.text)
        .join('')
        .trim();

      last_speaker = paragraph.speaker;
      return paragraphText;
    })
    .filter((x) => x !== '')
    .join('\n');
}
