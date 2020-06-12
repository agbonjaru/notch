import { FormGroup, AbstractControl } from "@angular/forms";

// tslint:disable-next-line:max-line-length
export const VALIDEMAILREGEX = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

export const AMOUNTBYDATESPLITER = (payload, arrayNumber) => {
  const returnValue = {};
  if (arrayNumber === 3) {
    for (const item of payload) {
      const { totalAmount, createdDate } = item;
      const splitCreatedAt = createdDate.split("-");
      const month = splitCreatedAt[1];

      if (!Object.keys(returnValue).includes(month)) {
        returnValue[month] = Number(totalAmount);
      } else {
        returnValue[month] += Number(totalAmount);
      }
    }
  } else if (arrayNumber === 2) {
    for (const item of payload) {
      const { createdDate, amount } = item;
      const splitCreatedAt = createdDate.split("-");
      const month = splitCreatedAt[1];
      // console.log(year, month, 'monthss');
      if (!Object.keys(returnValue).includes(month)) {
        returnValue[month] = Number(amount);
      } else {
        returnValue[month] += Number(amount);
      }
    }
  } else {
    for (const item of payload) {
      const { createdOn, totalCost } = item;
      const stringDate = new Date(createdOn);
      const splitCreatedOn = stringDate.toISOString().split("-");
      const month = splitCreatedOn[1];

      if (!Object.keys(returnValue).includes(month)) {
        returnValue[month] = Number(totalCost);
      } else {
        returnValue[month] += Number(totalCost);
      }
    }
  }

  const returnDataArray = [];

  if (Object.keys(returnValue).length !== 0) {
    for (const item in returnValue) {
      returnDataArray[Number(item) - 1] = returnValue[item];
    }
    return returnDataArray;
  } else {
    return returnDataArray;
  }
};

export const INVOICECHARTDATA = (payload, type) => {
  const returnValue = {};
  for (const item of payload) {
    const {
      createdOn,
      totalCost,
      paymentHistory,
      balanceDue,
      paymentDueDate,
    } = item;

    if (type === "totalInvoice") {
      const stringDate = new Date(createdOn);
      const splitCreatedOn = stringDate.toISOString().split("-");
      const month = splitCreatedOn[1];
      if (!Object.keys(returnValue).includes(month)) {
        returnValue[month] = Number(totalCost);
      } else {
        returnValue[month] += Number(totalCost);
      }
    } else if (type === "paymentReceived") {
      paymentHistory.map((res) => {
        const stringDate = new Date(res.date);
        const splitCreatedOn = stringDate.toISOString().split("-");
        const month = splitCreatedOn[1];
        if (!Object.keys(returnValue).includes(month)) {
          returnValue[month] = Number(res.amountPaid);
        } else {
          returnValue[month] += Number(res.amountPaid);
        }
      });
    } else if (type === "unpaid") {
      const stringDate = new Date(createdOn);
      const splitCreatedOn = stringDate.toISOString().split("-");
      const month = splitCreatedOn[1];
      if (!Object.keys(returnValue).includes(month)) {
        returnValue[month] = Number(balanceDue);
      } else {
        returnValue[month] += Number(balanceDue);
      }
    } else if (type === "overdues") {
      const stringDate = new Date(paymentDueDate);
      const today = Date.parse(new Date().toISOString());
      const splitCreatedOn = stringDate.toISOString().split("-");
      const month = splitCreatedOn[1];
      if (!Object.keys(returnValue).includes(month)) {
        if (today > paymentDueDate) {
          returnValue[month] = Number(balanceDue);
        }
      } else {
        if (today > paymentDueDate) {
          returnValue[month] += Number(balanceDue);
        }
      }
    }
  }

  const returnDataArray = [];

  if (Object.keys(returnValue).length !== 0) {
    for (const item in returnValue) {
      returnDataArray[Number(item) - 1] = returnValue[item];
    }
    return returnDataArray;
  } else {
    return returnDataArray;
  }
};

export const SALESORDERCHARTDATA = (payload, type) => {
  const returnValue = {};
  for (const item of payload) {
    const { createdDate, totalAmount, status } = item;

    if (type === "totalSalesOrder") {
      const splitCreatedOn = createdDate.split("-");
      const month = splitCreatedOn[1];
      if (!Object.keys(returnValue).includes(month)) {
        returnValue[month] = Number(totalAmount);
      } else {
        returnValue[month] += Number(totalAmount);
      }
    } else if (type === "totalApproved") {
      if (status === 2) {
        const splitCreatedOn = createdDate.split("-");
        const month = splitCreatedOn[1];
        if (!Object.keys(returnValue).includes(month)) {
          returnValue[month] = Number(totalAmount);
        } else {
          returnValue[month] += Number(totalAmount);
        }
      }
    } else if (type === "totalDeclined") {
      if (status === 1) {
        const splitCreatedOn = createdDate.split("-");
        const month = splitCreatedOn[1];
        if (!Object.keys(returnValue).includes(month)) {
          returnValue[month] = Number(totalAmount);
        } else {
          returnValue[month] += Number(totalAmount);
        }
      }
    } else if (type === "totalOpen") {
      if (status === 0) {
        const splitCreatedOn = createdDate.split("-");
        const month = splitCreatedOn[1];
        if (!Object.keys(returnValue).includes(month)) {
          returnValue[month] = Number(totalAmount);
        } else {
          returnValue[month] += Number(totalAmount);
        }
      }
    }
  }

  const returnDataArray = [];

  if (Object.keys(returnValue).length !== 0) {
    for (const item in returnValue) {
      returnDataArray[Number(item) - 1] = Number(returnValue[item]);
    }
    return returnDataArray;
  } else {
    return returnDataArray;
  }
};

// custom validator to check that two fields match
export const MustMatch = (controlName: string, matchingControlName: string) => {
  return (formGroup: FormGroup) => {
    const control = formGroup.controls[controlName];
    const matchingControl = formGroup.controls[matchingControlName];

    if (matchingControl.errors && !matchingControl.errors.mustMatch) {
      // return if another validator has already found an error on the matchingControl
      return;
    }

    // set error on matchingControl if validation fails
    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ mustMatch: true });
    } else {
      matchingControl.setErrors(null);
    }
  };
};

// This will not allow only spaces to be entered.
export function REMOVESPACESONLY(control: AbstractControl) {
  if (control && control.value && !control.value.replace(/\s/g, "").length) {
    control.setValue("");
  }
  return null;
}

// This will not allow only spaces to be entered.
export function TWODIGITDECIMALINPUT(control: AbstractControl) {
  return (formGroup: FormGroup) => {
    if (control && control.value) {
      // const decimals = control.toString().split(".")[1];
      if (control.value < 0.01 || control.value > 100) {
        control.setErrors({ pattern: true });

        if (control.value.includes(".")) {
          const decimals = control.toString().split(".")[1];
          if (decimals && decimals.length > 2) {
            control.setErrors({ pattern: true });
            return;
          }
        }
      }
      control.setErrors({ pattern: true });
    } else control.setErrors({ pattern: null });
  };
}
