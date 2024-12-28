// src/components/ReaderView/ReaderViewWrapper.js
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReaderView from './ReaderView';
import useAppStore from '../../data/store';

/**
 * @function parseRouteParam
 * @description Convert the route param into a valid decoded URL, whether it was encoded or not.
 * @param {string} param - The raw route param from useParams()
 * @returns {string|null} - A decoded URL, e.g. "https://www.npr.org/...", or null if invalid
 */
function parseRouteParam(param) {
  // Check for obviously invalid URLs
  if (
    !param ||
    !(param.startsWith('http') || param.startsWith('https'))
  ) {
    console.error(
      'Invalid URL param format or missing protocol. Returning null:',
      param
    );
    return null;
  }

  let finalLink = param.trim();

  // Decode the URL if it's encoded
  if (finalLink.includes('%')) {
    try {
      finalLink = decodeURIComponent(finalLink);
    } catch (err) {
      console.error(
        'Could not decode URL param. Falling back to raw param:',
        param
      );
      return null;
    }
  }

  // Check if it's a valid URL after decoding
  try {
    new URL(finalLink);
  } catch (_) {
    console.error('Invalid URL after decoding. Returning null:', finalLink);
    return null;
  }

  return finalLink;
}

/**
 * @function ReaderViewWrapper
 * @description Wrapper component for the ReaderView route. Handles URL parsing and error display.
 * @param {object} props - The component props.
 * @param {object[]} props.items - The feed items.
 * @returns {JSX.Element} - The rendered component.
 */
const ReaderViewWrapper = ({ items }) => {
  const params = useParams();
  const navigate = useNavigate();
  const { apiUrl, openAIKey } = useAppStore();

  // Access the wildcard portion of the URL
  const link = parseRouteParam(params['*']);

  // Attempt to find an existing item
  let matchedItem = items?.find((feedItem) => feedItem.link === link);

  // If there's no match and link is valid, create a placeholder item object
  if (!matchedItem && link) {
    matchedItem = {
      link,
      title: 'Article Preview',
      description: '',
      favicon: '',
      published: null,
    };
  }

  /**
   * @function handleCloseModal
   * @description Navigate back on close
   */
  const handleCloseModal = () => {
    navigate('/');
  };

  // If link is null, render an error or redirect
  if (!link) {
    return <div>Invalid URL provided.</div>;
  }

  // Pass the matchedItem (or placeholder) to ReaderView
  return (
    <ReaderView
      url={matchedItem.link}
      item={matchedItem}
      apiUrl={apiUrl}
      openAIKey={openAIKey}
      onRequestClose={handleCloseModal}
    />
  );
};

export default ReaderViewWrapper;