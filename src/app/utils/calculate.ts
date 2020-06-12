class Calculate {
  markup(markUpType: string, markUp: any, purchasePrice: number) {
    let result = purchasePrice;
    const percent = (purchasePrice * parseFloat(markUp)) / 100 + purchasePrice;
    const flat = purchasePrice + parseFloat(markUp);
    result =
      markUpType === "flat"
        ? flat
        : markUpType === "percent"
        ? percent
        : result;
    // console.log(result, "markup");

    return result ? Number(result.toFixed()) : result;
  }

  taxAmount(unitprice, quantity, tax, taxInclusive) {
    if (tax !== "none" && taxInclusive) {
      // Vat and Inclusive
      const totalcost = unitprice * quantity * 100;
      const rate = Number(tax) + 100;
      const taxAmountBeforeInclusion =
        unitprice * quantity - Number((totalcost / rate).toFixed(2));
      // console.log(taxAmountBeforeInclusion.toFixed(2), 'Vat and Inclusive');
      return Number(taxAmountBeforeInclusion.toFixed(2));
    } else if (tax !== "none" && !taxInclusive) {
      // Vat and Not Inclusive
      const totalcost = unitprice * quantity;
      const rate = Number(tax) / 100;
      const taxAmountWithoutInclusion = Number((totalcost * rate).toFixed(2));
      return Number(taxAmountWithoutInclusion);
    } else if (tax === "none") {
      // console.log(0, 'none');
      return 0;
    }
  }
}
export default Calculate;
