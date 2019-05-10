import React from "react";
import PropTypes from "prop-types";

import ValueDenomination from "modules/common/components/value-denomination/value-denomination";
import classNames from "classnames";
import { CATEGORICAL } from "modules/markets/constants/market-types";
import { MARKET, BUY, LIMIT, SELL } from "modules/transactions/constants/types";
import { CUTOFF_READABLE } from "modules/markets/constants/cutoff-date";
import { isPastV2Cutoff } from "modules/markets/helpers/is-market-past-v2-cutoff";
import ReactTooltip from "react-tooltip";
import TooltipStyles from "modules/common/less/tooltip.styles";
import { CreateMarketEdit, Hint } from "modules/common/components/icons";
import Styles from "modules/trading/components/trading--confirm/trading--confirm.styles";

const MarketTradingConfirm = ({
  trade,
  isMobile,
  orderType,
  selectedNav,
  prevPage,
  market,
  selectedOutcome,
  doNotCreateOrders,
  showOrderPlaced,
  marketQuantity,
  handleFilledOnly,
  marketReviewModal,
  marketCutoffModal,
  marketReviewSeen,
  closeModal
}) => {
  const {
    numShares,
    limitPrice,
    tradingFees,
    potentialEthProfit,
    potentialProfitPercent,
    potentialEthLoss,
    potentialLossPercent,
    totalCost,
    shareCost
  } = trade;
  const negativeProfit = potentialEthProfit && potentialEthProfit.value <= 0;

  const placeTrade = e => {
    market.onSubmitPlaceTrade(
      selectedOutcome.id,
      (err, tradeGroupID) => {
        // onSent/onFailed CB
        if (!err) {
          showOrderPlaced();
        }
      },
      res => {
        if (doNotCreateOrders && res.res !== res.sharesToFill)
          handleFilledOnly(res.tradeInProgress);
        // onComplete CB
      },
      doNotCreateOrders
    );
    prevPage(e, true);
  };

  const showMarketCutoffModal = () => {
    marketCutoffModal({
      title: "Market notice",
      description: [
        "ETH staked on this market is at risk. <font color='#EB5757'>Users are advised <strong>not to trade.</strong></font>",
        `This market expires after the end-time cutoff date for the Augur v2 release phase. Markets ending after ${CUTOFF_READABLE} are at a higher risk of resolving incorrectly.`,
        `<a href="https://docs.augur.net" rel="noopener noreferrer" target="_blank"><u>Read more about the V2 launch plan and how it may affect you</u></a>`
      ],
      cancelButtonText: "Cancel",
      submitAction: () => {
        placeTrade();
        closeModal();
      },
      submitButtonText: "Proceed Anyway"
    });
  };

  return (
    <section className={Styles.TradingConfirm}>
      <div className={Styles.TradingConfirm__header}>
        {!isMobile && (
          <div
            className={
              selectedNav === BUY
                ? Styles.TradingConfirm_arrow_buy
                : Styles.TradingConfirm_arrow_sell
            }
          />
        )}
        {!isMobile && <h2>Confirm {selectedNav} order?</h2>}
        {isMobile && (
          <h2
            className={classNames({
              [`${Styles.order__buy}`]: selectedNav === BUY,
              [`${Styles.order__sell}`]: selectedNav === SELL
            })}
          >
            Confirm {selectedNav} order?
          </h2>
        )}
        <span>
          <button onClick={prevPage}>{CreateMarketEdit}</button>
        </span>
      </div>
      <ul className={Styles.TradingConfirm__details}>
        {!isMobile &&
          market.marketType === CATEGORICAL && (
            <li>
              <span>Outcome</span>
              <span>{selectedOutcome.name}</span>
            </li>
          )}
        {orderType === MARKET && (
          <li>
            <span>Total Cost</span>
            <span>
              <ValueDenomination
                formatted={totalCost ? totalCost.formatted : "0"}
              />{" "}
              ETH
            </span>
          </li>
        )}
        {orderType === LIMIT && (
          <li>
            <span>Quantity</span>
            <span>{numShares} Shares</span>
          </li>
        )}
        {orderType === LIMIT && (
          <li>
            <span>Limit Price</span>
            <span>{limitPrice} ETH</span>
          </li>
        )}
        <li>
          <span className={Styles.TradingConfirm__FeeLabel}>Est. Fee</span>
          <span className={Styles.TradingConfirm__TooltipContainer}>
            <label
              className={classNames(
                TooltipStyles.TooltipHint,
                Styles.TradingConfirm__TooltipHint
              )}
              data-tip
              data-for="tooltip--fee"
            >
              {Hint}
            </label>
            <ReactTooltip
              id="tooltip--fee"
              className={TooltipStyles.Tooltip}
              effect="solid"
              place="bottom"
              type="light"
            >
              <p>
                The reporting fee adjusts every week, which may cause the
                market‘s total fee to go up or down.
              </p>
              <a
                href="http://docs.augur.net/#reporting-fee"
                rel="noopener noreferrer"
                target="_blank"
              >
                {" "}
                Learn more here.
              </a>
            </ReactTooltip>
          </span>
          <span>
            {tradingFees ? tradingFees.formattedValue : "0"} <span>ETH</span>
          </span>
        </li>
      </ul>
      {orderType === LIMIT && (
        <ul className={Styles.TradingConfirm__total}>
          <li>
            <span>Est. Cost</span>
          </li>
          <li>
            <span>
              <ValueDenomination
                formatted={totalCost ? totalCost.fullPrecision : "0"}
              />{" "}
              <span>ETH</span>
            </span>
            <span>
              <ValueDenomination
                formatted={shareCost ? shareCost.fullPrecision : "0"}
              />{" "}
              <span>Shares</span>
            </span>
          </li>
        </ul>
      )}
      {orderType === MARKET && (
        <ul className={Styles.TradingConfirm__total}>
          <li>
            <span>Quantity</span>
            <span>{marketQuantity}</span>
          </li>
        </ul>
      )}
      <ul className={Styles.TradingConfirm__potential}>
        <li>
          <span>Potential Profit</span>
          <span
            className={classNames({
              [`${Styles.negative__profit}`]: negativeProfit
            })}
          >
            <ValueDenomination
              formatted={
                potentialEthProfit
                  ? potentialEthProfit.formattedValue.toString()
                  : "0"
              }
            />{" "}
            <span
              className={classNames({
                [`${Styles.negative__profit}`]: negativeProfit
              })}
            >
              ETH (
              {potentialProfitPercent ? potentialProfitPercent.formatted : "0"}
              %)
            </span>
          </span>
        </li>
        <li>
          <span>Potential Loss</span>
          <span>
            <span>
              <ValueDenomination
                formatted={
                  potentialEthLoss
                    ? potentialEthLoss.formattedValue.toString()
                    : "0"
                }
              />{" "}
              <span>
                ETH (
                {potentialLossPercent ? potentialLossPercent.formatted : "0"}
                %)
              </span>
            </span>
          </span>
        </li>
      </ul>
      <div className={Styles.TradingConfirmation__actions}>
        <button
          className={Styles["TradingConfirmation__button--back"]}
          onClick={prevPage}
        >
          Back
        </button>
        <button
          className={Styles["TradingConfirmation__button--submit"]}
          onClick={e => {
            e.preventDefault();
            if (isPastV2Cutoff(market.endTime.timestamp)) {
              showMarketCutoffModal();
            } else if (!marketReviewSeen) {
              marketReviewModal({
                marketId: market.id,
                cb: () => {
                  closeModal();
                  placeTrade(e);
                }
              });
            } else {
              placeTrade(e);
            }
          }}
        >
          Confirm {selectedNav}
        </button>
      </div>
    </section>
  );
};

MarketTradingConfirm.propTypes = {
  market: PropTypes.object.isRequired,
  marketReviewSeen: PropTypes.bool.isRequired,
  selectedNav: PropTypes.string.isRequired,
  orderType: PropTypes.string.isRequired,
  marketQuantity: PropTypes.string.isRequired,
  doNotCreateOrders: PropTypes.bool.isRequired,
  selectedOutcome: PropTypes.object.isRequired,
  prevPage: PropTypes.func.isRequired,
  trade: PropTypes.shape({
    numShares: PropTypes.string,
    limitPrice: PropTypes.string,
    tradingFees: PropTypes.object,
    potentialEthProfit: PropTypes.object,
    potentialProfitPercent: PropTypes.object,
    potentialEthLoss: PropTypes.object,
    potentialLossPercent: PropTypes.object,
    totalCost: PropTypes.object,
    shareCost: PropTypes.object
  }).isRequired,
  isMobile: PropTypes.bool.isRequired,
  showOrderPlaced: PropTypes.func.isRequired,
  handleFilledOnly: PropTypes.func.isRequired,
  marketReviewModal: PropTypes.func.isRequired,
  marketCutoffModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired
};

export default MarketTradingConfirm;
