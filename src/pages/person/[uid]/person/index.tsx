import React, { useEffect } from 'react';
import { useRouteMatch, useDispatch, useSelector, PersonModel } from 'umi';

import { PageParam } from '@/pages/person/[uid]/types';

export default function PagePerson() {
  const match = useRouteMatch<PageParam>();
  const uid = match.params.uid;
  const dispatch = useDispatch();
  const {} = useSelector(PersonModel.currentState);

  useEffect(() => {
    dispatch(
      PersonModel.createAction(PersonModel.ActionType.getPersonInfo)({ uid }),
    );
  }, [dispatch, uid]);

  return <span>hello card</span>;
}
