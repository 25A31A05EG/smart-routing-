import React, { useState } from 'react';
import { X, PlusCircle, MapPin, Link2 } from 'lucide-react';
import { EdgeType, GraphNode, NodeCategory } from '../types/graph';

interface AddNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingNodes: GraphNode[];
  onAddNodeAndEdge: (
    node: GraphNode,
    connectedNodeId: string,
    edgeDistance: number,
    edgeType: EdgeType
  ) => void;
}

export const AddNodeModal: React.FC<AddNodeModalProps> = ({
  isOpen,
  onClose,
  existingNodes,
  onAddNodeAndEdge,
}) => {
  const [name, setName] = useState('');
  const [buildingCode, setBuildingCode] = useState('');
  const [category, setCategory] = useState<NodeCategory>('academic');
  const [connectToId, setConnectToId] = useState(existingNodes[0]?.id || '');
  const [distance, setDistance] = useState(180);
  const [edgeType, setEdgeType] = useState<EdgeType>('walkway');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Place near connected node or center
    const connectedNode = existingNodes.find((n) => n.id === connectToId);
    const baseX = connectedNode ? connectedNode.x + (Math.random() > 0.5 ? 90 : -90) : 550;
    const baseY = connectedNode ? connectedNode.y + (Math.random() > 0.5 ? 90 : -90) : 350;

    const clampedX = Math.max(60, Math.min(1040, baseX));
    const clampedY = Math.max(60, Math.min(640, baseY));

    const newNode: GraphNode = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      category,
      buildingCode: buildingCode.trim().toUpperCase() || undefined,
      x: clampedX,
      y: clampedY,
      description: 'Custom added location',
    };

    onAddNodeAndEdge(newNode, connectToId, distance, edgeType);
    setName('');
    setBuildingCode('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-2.5">
            <PlusCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add Location to Map</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Location Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Innovation Drone Lab, Coffee Haven"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Building Code (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. DL-1"
                value={buildingCode}
                onChange={(e) => setBuildingCode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as NodeCategory)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="academic">Academic Hall</option>
                <option value="residential">Residential / Dorm</option>
                <option value="dining">Dining / Food</option>
                <option value="library">Library / Study</option>
                <option value="medical">Medical / Health</option>
                <option value="transit">Transit Hub</option>
                <option value="recreation">Park / Green Area</option>
                <option value="commercial">Commercial / Office</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="block text-slate-700 dark:text-slate-300 font-semibold mb-2 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-blue-500" />
              <span>Connect Edge to Existing Node</span>
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 text-[11px] mb-1">Connect To</label>
                <select
                  value={connectToId}
                  onChange={(e) => setConnectToId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {existingNodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 text-[11px] mb-1">Distance (meters)</label>
                <input
                  type="number"
                  min="20"
                  max="1500"
                  value={distance}
                  onChange={(e) => setDistance(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-slate-500 text-[11px] mb-1">Edge Road Type</label>
              <select
                value={edgeType}
                onChange={(e) => setEdgeType(e.target.value as EdgeType)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="walkway">Pedestrian Walkway</option>
                <option value="bikelane">Dedicated Bike Lane</option>
                <option value="road">Access Road</option>
                <option value="transit_route">Express Transit Way</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm"
            >
              Add to Graph
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
