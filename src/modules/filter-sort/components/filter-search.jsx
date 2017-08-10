import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Input from 'modules/common/components/input';

import parseQuery from 'modules/app/helpers/parse-query';
import debounce from 'utils/debounce';
import getValue from 'utils/get-value';

import { FILTER_SEARCH_PARAM } from 'modules/app/constants/param-names';

// NOTE --  Currently the searchKeys can accomodate target's of type string and array
export default class FilterSearch extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    items: PropTypes.array.isRequired,  // Raw items to filter against, assumes array of objects
    keys: PropTypes.array.isRequired,    // Keys w/in each item's object to apply filter
    updateFilter: PropTypes.func.isRequired,
    searchPlaceholder: PropTypes.string
  }

  constructor(props) {
    super(props);

    this.state = {
      search: ''
    };

    this.onChangeSearch = this.onChangeSearch.bind(this);
    this.debouncedOnChangeSearch = debounce(this.onChangeSearch.bind(this));
    this.filterBySearch = this.filterBySearch.bind(this);
  }

  componentWillMount() {
    const search = parseQuery(this.props.location.search)[FILTER_SEARCH_PARAM];
    this.onChangeSearch(search);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.items !== nextProps.items) this.onChangeSearch(this.state.search, nextProps.items);
  }

  onChangeSearch(search, items, debounce) {
    this.setState({ search });

    if (debounce) return this.debouncedOnChangeSearch(search, items);

    if (search && search.length) {
      this.filterBySearch(search, items);
    } else {
      this.props.updateFilter(null);
    }
  }

  filterBySearch(search, items) { // If ANY match is found, the item is included in the returned array
    const searchArray = cleanKeywordsArray(decodeURIComponent(search));

    const checkStringMatch = (value, search) => value.toLowerCase().indexOf(search) !== -1;

    const checkArrayMatch = (item, keys, search) => { // Accomodates n-1 key's value of either array or object && final key's value of type string or array
      const parentValue = getValue(item, keys.reduce((p, key, i) => i + 1 !== keys.length ? `${p}${i !== 0 ? '.' : ''}${key}` : p, '')); // eslint-disable-line no-confusing-arrow

      if (parentValue === null) return false;

      if (Array.isArray(parentValue) && parentValue.length) {
        return parentValue.some(value => value[keys[keys.length - 1]].toLowerCase().indexOf(search) !== -1);
      } else if (typeof parentValue === 'object' && Object.keys(parentValue).length) {
        return parentValue[keys[keys.length - 1]].toLowerCase().indexOf(search) !== -1;
      }

      return false; // Just in case
    };

    const matchedItems = items.reduce((p, item, i) => {
      const matchedSearch = searchArray.some(search =>
        this.props.keys.some((key) => {
          if (typeof key === 'string') return checkStringMatch((item[key] || ''), search);

          return checkArrayMatch(item, key, search);
        }
      ));

      if (matchedSearch) {
        return [...p, i];
      }

      return p;
    }, []);

    this.props.updateFilter(matchedItems);

    // TODO -- update location
  }

  render() {
    const p = this.props;
    const s = this.state;

    return (
      <article className="filter-search-input" >
        <Input
          isSearch
          isClearable
          placeholder={p.searchPlaceholder || 'Search'}
          value={s.search}
          onChange={value => this.onChangeSearch(value, p.items, true)}
        />
      </article>
    );
  }
}


function cleanKeywords(keywords) {
  return (keywords || '').replace(/\s+/g, ' ').trim();
}

function cleanKeywordsArray(keywords) {
  const CleanKeywords = cleanKeywords(keywords).toLowerCase();
  return CleanKeywords ? CleanKeywords.split(' ').sort() : [];
}