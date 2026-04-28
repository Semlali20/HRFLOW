import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { PermissionService } from '../../core/services/permission.service';

/**
 * Structural directive to conditionally render elements based on user permissions.
 *
 * Usage:
 *   <button *hasPermission="'EMPLOYEE_CREATE'">Add Employee</button>
 *   <div *hasPermissionAny="['EMPLOYEE_READ', 'STAGIAIRE_READ']">...</div>
 */
@Directive({ selector: '[hasPermission]', standalone: true })
export class HasPermissionDirective implements OnInit {

    @Input('hasPermission') permission!: string;

    constructor(
        private templateRef: TemplateRef<unknown>,
        private viewContainer: ViewContainerRef,
        private permService: PermissionService
    ) {}

    ngOnInit(): void {
        if (this.permService.has(this.permission)) {
            this.viewContainer.createEmbeddedView(this.templateRef);
        } else {
            this.viewContainer.clear();
        }
    }
}

@Directive({ selector: '[hasPermissionAny]', standalone: true })
export class HasPermissionAnyDirective implements OnInit {

    @Input('hasPermissionAny') permissions!: string[];

    constructor(
        private templateRef: TemplateRef<unknown>,
        private viewContainer: ViewContainerRef,
        private permService: PermissionService
    ) {}

    ngOnInit(): void {
        if (this.permService.hasAny(...this.permissions)) {
            this.viewContainer.createEmbeddedView(this.templateRef);
        } else {
            this.viewContainer.clear();
        }
    }
}
