import { useState } from 'react';
import EpdUpload from './EpdUpload';
import MaterialForm from './MaterialForm';
import MaterialsTable from './MaterialsTable';
import { MaterialPhases, Project } from '../types';
import { CreateMaterialInput } from '../api/projects';
import { downloadFile } from '../api/download';

interface ProjectDetailProps {
  project: Project;
  onAddMaterial: (material: CreateMaterialInput) => void;
  onDeleteMaterial: (id: string) => void;
  onAddColumn: (label: string, type: 'text' | 'number') => void;
  message?: string;
}

const ProjectDetail = ({ project, onAddMaterial, onDeleteMaterial, onAddColumn, message }: ProjectDetailProps) => {
  const [prefillPhases, setPrefillPhases] = useState<MaterialPhases | undefined>();
  const [epdStatus, setEpdStatus] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-semibold">Projectadministratie</h3>
          <p className="text-sm text-gray-600">
            Koppel EPD's aan fasen A1-A3 en D, vul handmatig aan en registreer transport/aanleg-profielen.
          </p>
        </div>
        <div className="text-xs text-gray-500">Project-id: {project.id}</div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => downloadFile(`/exports/projects/${project.id}/export.xlsx`, `project-${project.id}.xlsx`)}
          className="px-3 py-2 rounded-xl bg-blue-700 text-white text-sm hover:bg-blue-600"
        >
          Exporteer naar Excel
        </button>
        <button
          onClick={() => downloadFile(`/exports/projects/${project.id}/report.pdf`, `project-${project.id}.pdf`)}
          className="px-3 py-2 rounded-xl bg-gray-800 text-white text-sm hover:bg-gray-700"
        >
          Download PDF-rapport
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <EpdUpload
          projectId={project.id}
          onParsed={(count, phases) => {
            setPrefillPhases(phases);
            setEpdStatus(`EPD gelezen en ${count} velden gevuld.`);
          }}
        />
        <MaterialForm
          customFields={project.customFields}
          onAddMaterial={onAddMaterial}
          onAddColumn={onAddColumn}
          message={message || epdStatus}
          prefillPhases={prefillPhases}
        />
      </div>

      <MaterialsTable project={project} onDelete={onDeleteMaterial} />
    </div>
  );
};

export default ProjectDetail;
