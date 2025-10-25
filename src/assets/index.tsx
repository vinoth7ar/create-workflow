import { ChevronUp, Trash2, GripVertical, ArrowRight, Circle } from 'lucide-react';

export const ArrowSymbol = () => (
  <div className="w-6 h-6 flex items-center justify-center">
    <ArrowRight className="w-5 h-5 text-gray-700" />
  </div>
);

export const SignBadge = () => (
  <div className="w-6 h-6 flex items-center justify-center">
    <Circle className="w-5 h-5 text-gray-700" />
  </div>
);

export const ChevronDoubleUp = () => (
  <button className="text-gray-400 hover:text-gray-200 transition-colors">
    <ChevronUp className="w-5 h-5" />
  </button>
);

export const TrashIcon = () => (
  <Trash2 className="w-5 h-5" />
);

export const DragReorder = () => (
  <GripVertical className="w-5 h-5 text-gray-400" />
);
