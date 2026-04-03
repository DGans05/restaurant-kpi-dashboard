interface ChecklistItem {
  id: string;
  label: string;
}

interface ChecklistSection {
  id: string;
  title: string;
  items: ChecklistItem[];
}

interface ChecklistProps {
  section: ChecklistSection;
  checkedState: Record<string, boolean>;
  onToggle: (id: string) => void;
}

export default function Checklist({ section, checkedState, onToggle }: ChecklistProps) {
  return (
    <>
      <h3>{section.title}</h3>
      <ul className="checklist">
        {section.items.map((item) => {
          const checked = Boolean(checkedState[item.id]);
          return (
            <li className={`checklist-item ${checked ? "checked" : ""}`} key={item.id}>
              <input
                checked={checked}
                id={item.id}
                onChange={() => onToggle(item.id)}
                type="checkbox"
              />
              <label htmlFor={item.id}>{item.label}</label>
            </li>
          );
        })}
      </ul>
    </>
  );
}
