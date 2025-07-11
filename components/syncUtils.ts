export const filterTabs = (tabs, query, device) => {
  return tabs.filter(tab => 
    tab.title.toLowerCase().includes(query.toLowerCase()) &&
    (device === 'all' || tab.device === device)
  );
};
