import React from 'react';
import MonacoEditor from '@monaco-editor/react';
import styles from './ResponseSection.module.css';
import { useTranslations } from 'next-intl';

interface ResponseSectionProps {
  response: string | null;
  error: string | null;
  statusCode: number | null;
}

const ResponseSection: React.FC<ResponseSectionProps> = ({
  response,
  error,
  statusCode,
}) => {
  const e = useTranslations('RequestErrors');
  return (
    <div className={styles.responseSection}>
      {statusCode !== null && (
        <div className={styles.statusCode}>
          <strong>Status Code:</strong> {statusCode}
        </div>
      )}
      {response && (
        <div data-testid="editor-container" className={styles.editorContainer}>
          <MonacoEditor
            height="100%"
            language="json"
            value={response}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              automaticLayout: true,
              lineNumbers: 'off',
            }}
          />
        </div>
      )}
      {error && <div className={styles.errorSection}>{e(`${error}`)}</div>}
    </div>
  );
};

export default ResponseSection;
