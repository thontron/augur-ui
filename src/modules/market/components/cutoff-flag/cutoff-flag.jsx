import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import { Flag } from "modules/common/components/icons";
import {
  CUTOFF_READABLE,
  CUTOFF_URL
} from "modules/markets/constants/cutoff-date";
import { isPastV2Cutoff } from "modules/markets/helpers/is-market-past-v2-cutoff";
import ReactTooltip from "react-tooltip";
import TooltipStyles from "modules/common/less/tooltip.styles";

import Styles from "modules/market/components/cutoff-flag/cutoff-flag.styles";

// add link to read more
const CutoffFlag = ({ endTime }) => (
  <>
    {isPastV2Cutoff(endTime) && (
      <div className={Styles.CutoffFlag}>
        <span data-tip data-for="tooltip-cutoff-flag">
          {Flag}
        </span>
        <ReactTooltip
          id="tooltip-cutoff-flag"
          className={classNames(TooltipStyles.Tooltip, Styles.Tooltip)}
          effect="solid"
          place="top"
          type="light"
        >
          <p>
            This market has an end-time after the cutoff date for the Augur v2
            release phase. Markets ending after {CUTOFF_READABLE} are at a
            higher risk of resolving incorrectly.
            <br />
            <a
              href={CUTOFF_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={Styles.ReadMore}
            >
              Read more
            </a>
          </p>
        </ReactTooltip>
      </div>
    )}
  </>
);

CutoffFlag.propTypes = {
  endTime: PropTypes.number.isRequired
};

export default CutoffFlag;
