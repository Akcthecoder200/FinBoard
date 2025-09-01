'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { hydrateWidgets } from '@/store/slices/widgetsSlice';

export function useWidgetPersistence() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Hydrate widgets from localStorage on component mount
    dispatch(hydrateWidgets());
  }, [dispatch]);
}
