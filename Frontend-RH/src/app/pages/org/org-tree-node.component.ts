import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface OrgNode {
  id: number;
  name: string;
  type: 'department' | 'position';
  children: OrgNode[];
}

@Component({
  selector: 'app-org-tree-node',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="org-node-wrapper">
      <div class="org-node" [class.dept-node]="node.type === 'department'" [class.pos-node]="node.type === 'position'">
        <div class="node-icon">
          <i [class]="node.type === 'department' ? 'bx bx-building-house' : 'bx bx-badge'"></i>
        </div>
        <div class="node-label">{{ node.name }}</div>
      </div>
      <div class="node-children" *ngIf="node.children && node.children.length > 0">
        <div class="children-row">
          <div class="child-wrapper" *ngFor="let child of node.children">
            <div class="connector-top"></div>
            <app-org-tree-node [node]="child"></app-org-tree-node>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .org-node-wrapper { display: flex; flex-direction: column; align-items: center; }
    .org-node {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      min-width: 120px; max-width: 150px; padding: 10px 14px;
      border-radius: 10px; text-align: center;
      border: 2px solid; cursor: default;
      position: relative; z-index: 1;
    }
    .dept-node { background: #e8f4fd; border-color: #3b82f6; color: #1e40af; }
    .pos-node { background: #f0fdf4; border-color: #22c55e; color: #166534; }
    .node-icon { font-size: 1.4rem; margin-bottom: 4px; }
    .node-label { font-size: 0.78rem; font-weight: 600; word-break: break-word; }
    .node-children { margin-top: 0; padding-top: 20px; position: relative; }
    .node-children::before {
      content: ''; position: absolute; top: 0; left: 50%;
      width: 2px; height: 20px; background: #94a3b8; transform: translateX(-50%);
    }
    .children-row { display: flex; gap: 24px; align-items: flex-start; position: relative; }
    .children-row::before {
      content: ''; position: absolute; top: 0;
      left: calc(60px); right: calc(60px);
      height: 2px; background: #94a3b8;
    }
    .child-wrapper { display: flex; flex-direction: column; align-items: center; }
    .connector-top { width: 2px; height: 20px; background: #94a3b8; }
  `]
})
export class OrgTreeNodeComponent {
  @Input() node!: OrgNode;
}
