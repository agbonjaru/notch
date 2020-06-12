


export const getCurrencySymbol = (code) => {
    let result = code
    switch (code) {
        case 'NGN':
            result = '&#8358;';
            break
        case 'CAD':
            result = '&#36;';
            break
        case 'USD':
            result = '&dollar;';
            break
        // case 'AED':
        //     result = '&#1583;';
        //     break
        case 'EUR':
            result = '&#128;';
            break
        default:
            result == '&#36;'
            break;
    }
    return result
}