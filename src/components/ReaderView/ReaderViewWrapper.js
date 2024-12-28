import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReaderView from './ReaderView';
import useAppStore from '../../data/store';

/**
 * @component
 * @param {object} props
 * @param {object[]} props.items - Array of feed item objects.
 * @description Wrapper component for ReaderView, handling routing and prop passing.
 */
const ReaderViewWrapper = ({ items }) => {
  const { encodedLink } = useParams();
  const navigate = useNavigate();
  const { apiUrl, openAIKey } = useAppStore();
  const link = decodeURIComponent(encodedLink);

  // Find the item with the matching link
  const item = items.find((item) => item.link === link);

  /**
   * @function handleCloseModal
   * @description Navigates back to the home page when the modal is closed.
   */
  const handleCloseModal = () => {
    console.log('ReaderViewWrapper - handleCloseModal called');
    navigate('/');
  };

  if (!item) {
    return <div>Item not found.</div>;
  }

  return (
    <ReaderView
      url={item.link}
      item={item}
      apiUrl={apiUrl}
      openAIKey={openAIKey}
      onRequestClose={handleCloseModal}
    />
  );
};

export default ReaderViewWrapper;