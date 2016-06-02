import {
    TRADING_FEE_DEFAULT,
    MAKER_FEE_DEFAULT,
    INITIAL_LIQUIDITY_DEFAULT,
    INITIAL_FAIR_PRICE_DEFAULT,
    SHARES_PER_ORDER_DEFAULT,
    SIZE_OF_BEST_DEFAULT,
    PRICE_WIDTH_DEFAULT,
    SEPARATION_DEFAULT
} from '../modules/create-market/constants/market-values-constraints'

import { makeNumber } from '../utils/make-number'

module.exports = createMarketForm();

function createMarketForm(){
    let form = {
        step: 1,
        errors: {},

        isValid: true,

        tradingFeePercent: TRADING_FEE_DEFAULT,
        makerFeePercent: MAKER_FEE_DEFAULT,
        initialLiquidity: INITIAL_LIQUIDITY_DEFAULT,

        // Advanced Market Creation
        defaultFairPrice: INITIAL_FAIR_PRICE_DEFAULT,

        initialFairPrice: [],
        sharesPerOrder: SHARES_PER_ORDER_DEFAULT,
        sizeOfBest: SIZE_OF_BEST_DEFAULT,
        priceWidth: PRICE_WIDTH_DEFAULT,
        separation: SEPARATION_DEFAULT,

        onValuesUpdated: newValues => updateForm(newValues)
    };

    return form

    function updateForm(newValues){
        if(form.step === 5 || newValues.step === 5){
            form.tradingFeePercent = makeNumber(form.tradingFeePercent, '%')
            form.volume = makeNumber(0)
        }

        form = {
            ...form,
            ...newValues
        };

        require('../selectors').update({ createMarketForm: form });
    }
}