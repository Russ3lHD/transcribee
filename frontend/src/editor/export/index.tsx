import { ComponentProps, useState, useEffect } from 'react';
import { Editor } from 'slate';

import { FormControl, Input, Select } from '../../components/form';
import { Modal } from '../../components/modal';
import { WebVttExportBody } from './webvtt';
import { TranscribeeExportBody } from './transcribee';
import { ApiDocument } from '../../api/document';
import { PlaintextExportBody } from './plaintext';
import { AvidMarkerFileExportBody } from './avid_marker_file';
import { useTimecodeOffset } from '../../utils/document';
import * as Automerge from '@automerge/automerge';

export type ExportProps = {
  outputNameBase: string;
  editor: Editor;
  onClose: () => void;
  document: ApiDocument;
};

export type ExportType = {
  name: string;
  component: (props: ExportProps) => JSX.Element;
};

export type CanExportResult = {
  canGenerate: boolean;
  reason: string;
};

const exportTypes: ExportType[] = [
  {
    name: 'Subtitles',
    component: WebVttExportBody,
  },
  {
    name: 'Plaintext',
    component: PlaintextExportBody,
  },
  {
    name: 'Transcribee Archive',
    component: TranscribeeExportBody,
  },
  {
    name: 'Avid Marker',
    component: AvidMarkerFileExportBody,
  },
];

export function ExportModal({
  onClose,
  editor,
  document,
  ...props
}: {
  onClose: () => void;
  editor: Editor;
  document: ApiDocument;
} & Omit<ComponentProps<typeof Modal>, 'label'>) {
  const [exportType, setExportType] = useState(exportTypes[0]);
  const [outputNameBase, setOutputNameBase] = useState(document?.name || 'document');
  const [offset, setOffset] = useTimecodeOffset(editor);
  const [localTimecode, setLocalTimecode] = useState(offset || '00:00:00:00');

  // Keep local timecode in sync with document timecode
  useEffect(() => {
    if (offset) {
      setLocalTimecode(offset);
    }
  }, [offset]);

  const updateTimecode = (newTimecode: string) => {
    setLocalTimecode(newTimecode);
    try {
      const clonedDoc = Automerge.clone(editor.doc);
      const newDoc = Automerge.change(clonedDoc, (doc) => {
        doc.timecodeOffset = newTimecode;
      });
      editor.onChange(newDoc);
    } catch (error) {
      console.error('Error updating timecode:', error);
    }
  };

  const ExportBodyComponent = exportType.component;

  return (
    <Modal {...props} onClose={onClose} label="Export as …">
      {exportTypes.length > 1 && (
        <Select
          value={exportTypes.indexOf(exportType)}
          onChange={(e) => {
            setExportType(exportTypes[parseInt(e.target.value)]);
          }}
        >
          {exportTypes.map((et, i) => (
            <option key={i} value={i}>
              {et.name}
            </option>
          ))}
        </Select>
      )}
      <FormControl label={'Name'} className="mt-2">
        <Input
          autoFocus
          value={outputNameBase}
          onChange={(e) => {
            setOutputNameBase(e.target.value);
          }}
        />
      </FormControl>
      <FormControl label={'Start Timecode (HH:MM:SS:FF)'} className="mt-2">
        <Input
          value={localTimecode}
          onChange={(e) => updateTimecode(e.target.value)}
          placeholder="00:00:00:00"
        />
      </FormControl>
      <ExportBodyComponent
        outputNameBase={outputNameBase}
        editor={editor}
        onClose={onClose}
        document={document}
      />
    </Modal>
  );
}
