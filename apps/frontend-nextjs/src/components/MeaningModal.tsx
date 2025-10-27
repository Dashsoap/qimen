'use client';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { hideMeaning } from '@/lib/store/infoSlice';
import './MeaningModal.css';

export default function MeaningModal() {
  const dispatch = useDispatch();
  const { showMeaning, displayName, currentMeaning, isHtmlContent } = useSelector((state: RootState) => state.info);

  const handleClose = () => {
    dispatch(hideMeaning());
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!showMeaning) {
    return null;
  }

  return (
    <div className="meaning-modal" onClick={handleBackdropClick}>
      <div className="meaning-content">
        <div className="meaning-header">
          <h3>{displayName}解释</h3>
          <span className="close-btn" onClick={handleClose}>×</span>
        </div>
        <div className="meaning-body">
          {!isHtmlContent ? (
            <p>{currentMeaning}</p>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: currentMeaning }} />
          )}
        </div>
      </div>
    </div>
  );
}

