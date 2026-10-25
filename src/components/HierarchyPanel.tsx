import { getShape } from '../shapes'
import type { Component } from '../component'

interface Props {
  components: Component[]
  selectedId: string | null
  onSelect: (id: string) => void
}

/**
 * File-explorer style tree of the components in the work area. Each component is a
 * top-level node showing its name, and the shape that was added as part of it is
 * nested beneath as its child. Clicking a component selects it.
 */
export default function HierarchyPanel({ components, selectedId, onSelect }: Props) {
  return (
    <aside className="hierarchy" aria-labelledby="hierarchy-title">
      <h2 id="hierarchy-title" className="hierarchy-title">Hierarchy</h2>
      {components.length === 0 ? (
        <p className="hierarchy-empty">No components yet.</p>
      ) : (
        <ul className="tree" role="tree" aria-label="Components">
          {components.map((c) => {
            const shape = getShape(c.shape.shapeId)
            const selected = c.id === selectedId

            return (
              <li
                key={c.id}
                className="tree-node"
                role="treeitem"
                aria-expanded="true"
                aria-selected={selected}
              >
                <button
                  type="button"
                  className={selected ? 'tree-row tree-row-selected' : 'tree-row'}
                  onClick={() => onSelect(c.id)}
                >
                  <span className="tree-marker" aria-hidden="true">▾</span>
                  <span className="tree-name">{c.name}</span>
                </button>
                <ul className="tree-children" role="group">
                  <li className="tree-leaf" role="treeitem" aria-selected={selected}>
                    <span className="tree-marker" aria-hidden="true">◇</span>
                    <span className="tree-shape" data-shape-ref={c.shape.id}>{shape.label}</span>
                  </li>
                </ul>
              </li>
            )
          })}
        </ul>
      )}
    </aside>
  )
}