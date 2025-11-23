import { useState } from 'react';
import EpdUpload from './EpdUpload';
import MaterialForm from './MaterialForm';
import MaterialsTable from './MaterialsTable';
import { Material, Project } from '../types';

interface ProjectDetailProps {
  project: Project;
  onChange: (project: Project) => void;
}

const ProjectDetail = ({ project, onChange }: ProjectDetailProps) => {
  const [message, setMessage] = useState('');

  const handleAddMaterial = (material: Material) => {
    onChange({ ...project, materials: [...project.materials, material] });
    setMessage('Materiaal opgeslagen in het actieve project.');
  };

  const handleDeleteMaterial = (id: string) => {
    onChange({ ...project, materials: project.materials.filter((m) => m.id !== id) });
  };

  const handleAddColumn = (label: string, type: 'text' | 'number') => {
    onChange({
      ...project,
      customColumns: [...project.customColumns, { id: crypto.randomUUID(), label, type }],
    });
  };

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

      <div className="grid md:grid-cols-2 gap-6">
        <EpdUpload onParsed={(values) => setMessage(`EPD gelezen en ${values} velden gevuld.`)} />
        <MaterialForm
          project={project}
          onAddMaterial={handleAddMaterial}
          onAddColumn={handleAddColumn}
          message={message}
        />
      </div>

      <MaterialsTable project={project} onDelete={handleDeleteMaterial} />
    </div>
  );
};

export default ProjectDetail;
