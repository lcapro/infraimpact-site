import { useMemo, useState } from 'react';
import { EpdUpload } from '../components/workspace/EpdUpload';
import { MaterialForm } from '../components/workspace/MaterialForm';
import { MaterialsTable } from '../components/workspace/MaterialsTable';
import { ProjectList } from '../components/workspace/ProjectList';
import { useWorkspace } from '../lib/useWorkspace';

export function WorkspacePage() {
  const { projects, addProject, addMaterial, removeMaterial, addCustomColumn, parseEpd } = useWorkspace();
  const [activeProjectId, setActiveProjectId] = useState<string | undefined>(projects[0]?.id);
  const [parsedMaterial, setParsedMaterial] = useState<any>();

  const activeProject = useMemo(() => projects.find((p) => p.id === activeProjectId) ?? projects[0], [
    activeProjectId,
    projects,
  ]);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
      <div className="border-r border-slate-100 p-6">
        <ProjectList
          projects={projects}
          activeId={activeProject?.id}
          onSelect={setActiveProjectId}
          onAdd={addProject}
        />
      </div>

      <div className="space-y-6 p-6">
        {activeProject ? (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.2fr_1fr]">
              <MaterialForm
                onSubmit={(material) => {
                  addMaterial(activeProject.id, material);
                  setParsedMaterial(undefined);
                }}
                customColumns={activeProject.customColumns}
                onAddColumn={(column) => addCustomColumn(activeProject.id, column)}
                parsed={parsedMaterial}
              />
              <div className="space-y-4">
                <EpdUpload
                  onParse={(content) => {
                    const parsed = parseEpd(content);
                    setParsedMaterial({ ...parsed, phases: parsed.phases });
                  }}
                />
                <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
                  <p className="font-semibold text-slate-900">Default aannames</p>
                  <ul className="mt-2 space-y-1 text-slate-600">
                    <li>Vrachtwagenvervoer: Diesel Euro 5 als standaard brandstof.</li>
                    <li>Aanleg/constructie: standaard diesel.</li>
                    <li>Fases A1-A3 & D: zowel handmatige input als EPD parsing mogelijk.</li>
                  </ul>
                </div>
              </div>
            </div>

            <MaterialsTable
              materials={activeProject.materials}
              customColumns={activeProject.customColumns}
              onRemove={(id) => removeMaterial(activeProject.id, id)}
            />
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-12 text-center text-slate-600">
            <p className="text-lg font-semibold text-slate-900">Start met je eerste project</p>
            <p>Voeg een project toe om materialen en MKI/CO₂ vast te leggen.</p>
          </div>
        )}
      </div>
    </div>
  );
}
