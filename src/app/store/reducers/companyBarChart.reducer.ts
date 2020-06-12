import {
  Actions,
  CREATE_CHART,
  SELECT_CHART,
  UPDATE_CHART,
  DELETE_CHART,
} from '../actions/companyBarChart.actions';

const initialStateChartData = {
  barChartData: [
    { data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], label: 'Invoice' },
    { data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], label: 'Quotation' },
    { data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], label: 'Deals' },
    { data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], label: 'Sales Order' },
  ],
  barChartTitle: 'Company Overview',
  barChartLabels: [
    'Jan',
    'Feb',
    'March',
    'April',
    'May',
    'June',
    'July',
    'Aug',
    'Sept',
    'Oct',
    'Nov',
    'Dec',
  ],
  barChartType: 'bar',
  barChartOptions: {
    scaleShowVerticalLines: false,
    responsive: true,
  },
  barChartLegend: true,
  // datasetColor,
};

export function companyBarChartReducer(
  state = initialStateChartData,
  action: Actions
) {
  switch (action.type) {
    case CREATE_CHART:
      return [action.payload];

    case UPDATE_CHART:
      const b = state;
      // b.forEach((part, index) =>
      //   part.id === action.id ? (state[index] = action.payload) : state[index]
      // );

      return b;

    // case DELETE_CHART:
    //   return state.filter(({ name }) => name !== 'action.id');

    default:
      return state;
  }
}

// export function invoiceSelectedReducer(
//   state: InvoiceProductStoreModel = initialStateSelectedInvoice,
//   action: Actions
// ) {
//   switch (action.type) {
//     case SELECT_CHART:
//       return action.payload;

//     default:
//       return state;
//   }
// }
