import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export function emptyValidator(): ValidatorFn {
    return (control:AbstractControl) : ValidationErrors | null => {

        const value = control.value;

        if (!value) {
            return null;
        }

        const lengthValue = value.trim().length;
        return lengthValue === 0 ? {emptyValue:true}: null;
    }
}
