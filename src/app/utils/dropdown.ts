const  dropDownToggle = (className: string, dropdownClass?) => {
  const dpClass = document.querySelectorAll(`span.${dropdownClass} svg`);
  const dpIcons = document.querySelectorAll(`span.dp-icon svg.fa-angle-right`);
  const dropdowns = document.querySelectorAll('.dropdown-list .dp-item');
  dropdowns.forEach(item => {
    if (!item.classList.contains(className)) {
      item.classList.remove('d-block');
    }
  });
  dpClass[0].classList.toggle('d-none');
  dpClass[1].classList.toggle('d-inline');
  document.querySelector(`.${className}`).classList.toggle('d-block');
};

export default dropDownToggle;
