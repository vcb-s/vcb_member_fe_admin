export const openLink = (link: string): void => {
  const ele = document.createElement('a');
  ele.referrerPolicy = 'no-referrer';
  ele.rel = 'noopener noreferrer nofollow';
  ele.href = link;
  ele.click();
};
