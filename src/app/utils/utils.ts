export const selectConfig = {
  search: true, // true/false for the search functionlity defaults to false,
  placeholder: "Search", // text to be displayed when no item is selected defaults to Select,
  // limitTo: 10, // a number thats limits the no of options displayed in the UI similar to angular's limitTo pipe
  noResultsFound: "No results found!", // text to be displayed when no items are found while searching
  searchPlaceholder: "search",
  displayKey: "name",
};
export const convertObjToArray = (obj: object) => {
  let array = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const element = obj[key];
      array.push(element);
    }
  }
  return array;
};
export const comparer = (otherArray) => {
  return function (current) {
    return (
      otherArray.filter(function (other) {
        return other.id == current.id;
      }).length == 0
    );
  };
};
export const userDetails = {
  orgId: 1,
  teamId: 25,
};
export const getPrtyColor = (prty) => {
  switch (prty) {
    case "HIGH":
      return "text-danger";
    case "LOW":
      return "text-primary";
    case "MEDIUM":
      return "text-info";
    case "URGENT":
      return "text-danger";
    default:
      return "text-secondary";
  }
};

export const addDays = (days) => {
  let date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

export const exportTableToCSV = (
  data: any[],
  columns: { value: string; title: string }[],
  filename
) => {
  // Nathan Apis - fix output date
  if (data[0].createdOn) {
    data = data.map((res: any) => {
      if (res.paymentDueDate) {
        res.paymentDueDate = new Date(res.paymentDueDate).toDateString();
      }
      if (res.endDate) {
        res.endDate = new Date(res.endDate).toDateString();
      }
      res.createdOn = new Date(res.createdOn).toDateString();

      return res;
    });
  }

  let newData = [];
  data.forEach((dat) => {
    newData.push(columns.map((col) => `"${dat[col.value]}"`).join(","));
  });
  newData = [columns.map((col) => col.title).join(","), ...newData];
  downloadCSV(newData.join("\n"), `${filename}.csv`);
};

export const downloadCSV = (csv, filename) => {
  var csvFile;
  var downloadLink;
  // CSV file
  csvFile = new Blob([csv], { type: "text/csv" });
  // Download link
  downloadLink = document.createElement("a");

  // File name
  downloadLink.download = filename;

  // Create a link to the file
  downloadLink.href = window.URL.createObjectURL(csvFile);

  // Hide download link
  downloadLink.style.display = "none";

  // Add the link to DOM
  document.body.appendChild(downloadLink);

  // Click download link
  downloadLink.click();
};

export function extractDeepPropertyByMapKey(obj: any, map: string): any {
  const keys = map.split(".");
  const head = keys.shift();

  return keys.reduce((prop: any, key: string) => {
    return !isUndefined(prop) && !isNull(prop) && !isUndefined(prop[key])
      ? prop[key]
      : undefined;
  }, obj[head || ""]);
}

export function isUndefined(value: any) {
  return typeof value === "undefined";
}

export function isNull(value: any) {
  return value === null;
}

export function toCamelCase(str) {
  return str
    .split(" ")
    .map(function (word, index) {
      // If it is the first word make sure to lowercase all the chars.
      if (index == 0) {
        return word.toLowerCase();
      }
      // If it is not the first word only upper case the first char and lowercase the rest.
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join("");
}

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
