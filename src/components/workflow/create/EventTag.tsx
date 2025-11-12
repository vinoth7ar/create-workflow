// Tag Component for displaying selected items in Event block
const EventTag = ({
  label,
  onRemove,
  testId,
  isMultiple,
}: {
  label: string;
  onRemove: (e: React.MouseEvent) => void;
  testId?: string;
  isMultiple?: boolean;
}) => (
  <div
    className={`inline-flex items-center gap-1 px-3 py-1 ${
      isMultiple ? 'bg-secondary-800' : 'bg-tertiary-500'
    } text-white rounded-full text-xs`}
    data-testid={testId}
  >
    <span>{label}</span>
    <button
      onClick={onRemove}
      className='hover:bg-tertiary-500 rounded-full p-0.5 px-1 transition-colors text-white'
      data-testid={`${testId}-remove`}
    >
      ×
    </button>
  </div>
);

export default EventTag;
