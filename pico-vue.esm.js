export const Modal = {
  props: {
    title: String,
    hideCloseX: Boolean,
    wide: Boolean
  },
  template: `<dialog ref="modal" :class="{wide}">
    <article>
      <header>
        <span v-if="!hideCloseX" aria-label="Close" class="close" @click="close(modal)"></span>
        {{ title || 'Modal' }}
      </header>
      <slot></slot>
    </article>
  </dialog>`,
  setup(_props, { emit }) {
    const modal = Vue.ref(null)
    const doc = document.documentElement
    const duration = 400

    function show(el) {
      doc.classList.add('modal-is-open', 'modal-is-opening')
      el.showModal()
      setTimeout(() => doc.classList.remove('modal-is-opening'), duration)
    }

    function close(el) {
      doc.classList.add('modal-is-closing')
      setTimeout(() => {
        doc.classList.remove('modal-is-closing', 'modal-is-open')
        el.close()
        Vue.nextTick(() => emit('closed'))
      }, duration)
    }

    Vue.onMounted(() => {
      modal.value.addEventListener('cancel', (ev) => {
        ev.preventDefault()
        close(ev.target)
      })
      if (!window.showModal)
        window.showModal = (id) => show(document.getElementById(id))
      if (!window.closeModal)
        window.closeModal = (id) => close(document.getElementById(id))
      document.querySelectorAll(`[data-show-modal=${modal.value.id}]`).forEach(el => el.addEventListener('click', () => show(modal.value)))
      modal.value.querySelectorAll(`[data-close-modal]`).forEach(el => el.addEventListener('click', () => close(modal.value)))
    })

    return { modal, close }
  }
}

export const Dropdown = {
  props: {
    label: String
  },
  inheritAttrs: false,
  template: `<details role="list" :dir="$attrs['dir']">
    <summary aria-haspopup="listbox" :role="$attrs['role']" :class="$attrs['class']">{{ label }}</summary>
    <ul role="listbox" @click="select">
      <slot></slot>
    </ul>
  </details>`,
  setup(_props, { emit }) {
    function select(ev) {
      emit('selected', ev.target.dataset.value || ev.target.innerText)
      ev.currentTarget.parentElement.removeAttribute('open')
    }
    return { select }
  }
}

export const SmartTable = {
  props: {
    items: Array,
    fields: Array,
    filter: Boolean,
    striped: Boolean,
    bordered: Boolean
  },
  template: `<figure :class="{bordered}">
    <table :role="striped ? 'grid' : ''">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.name">
            <div class="column">
              <input v-if="filter" class="column-filter compact" type="text" v-model="data.filterCols[col.name]" :placeholder="col.label">
              <span v-else :class="['column-label',{active:data.sortBy == col.name}]">{{ col.label }}</span>
              <div class="sorter">
                <div @click="sortAsc(col.name)" :class="['sort asc',{active:data.sortBy == col.name && data.sortDir == 1}]"></div>
                <div @click="sortDesc(col.name)" :class="['sort desc',{active:data.sortBy == col.name && data.sortDir == -1}]"></div>
              </div>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row,rx) in rows" :key="'r'+rx">
          <td v-for="col in columns" :key="col.name" :style="{ 'text-align': col.align || 'inherit' }">
            <slot :name="col.name.toLowerCase()" :="row">{{ row[col.name] }}</slot>
          </td>
        </tr>
        <tr v-if="rows.length == 0">
          <td :colspan="columns.length" style="text-align:center">
            <slot name="emptyFilterText">No items by that filter</slot>
          </td>
        </tr>
        <tr v-else-if="items.length == 0">
          <td :colspan="columns.length" style="text-align:center">
            <slot name="emptyText">No data</slot>
          </td>
        </tr>
      </tbody>
    </table>
  </figure>`,
  setup(props) {
    const data = Vue.reactive({
      sortBy: '',
      sortDir: 1,
      filterCols: {}
    })

    const columns = Vue.computed(() => {
      return (props.fields || Object.keys(props?.items[0] || {})).map(c => ({
        name: c.name || c,
        label: c.label || (c.name || c).split(/_|-|(?=A-Z])/).map(w => w[0].toUpperCase() + w.substring(1)).join(' '),
        align: c.align || false
      }))
    })

    const rows = Vue.computed(() => {
      if (!props.items || !Array.isArray(props.items)) return []
      const filters = Object.keys(data.filterCols)
      const results = props.filter && filters.length > 0
        ? props.items.filter(i => filters.map(f => i[f].toLowerCase().indexOf(data.filterCols[f]) > -1).every(b => b == true))
        : props.items
      return results.toSorted((a, b) => {
        if (a[data.sortBy] > b[data.sortBy]) return 1 * data.sortDir
        else if (a[data.sortBy] < b[data.sortBy]) return -1 * data.sortDir
        else return 0
      })
    })

    function unSort() {
      data.sortBy = ''
      data.sortDir = 1
    }

    function sortAsc(n) {
      if (data.sortBy == n) return unSort()
      data.sortBy = n
      data.sortDir = 1
    }

    function sortDesc(n) {
      if (data.sortBy == n) return unSort()
      data.sortBy = n
      data.sortDir = -1
    }

    Vue.watch(() => data.filterCols, (n, o) => {
      Object.keys(n).forEach(k => {
        if (data.filterCols[k] == '') delete data.filterCols[k]
      })
    }, { deep: true })

    return { data, rows, columns, sortAsc, sortDesc }
  }
}

export const Alert = {
  props: {
    type: String
  },
  template: `<div role="alert" :class="type">
    <slot></slot>
  </div>`
}

export const ThemeSwitch = {
  props: {
    icon: Boolean
  },
  template: `<label class="theme-switch-wrap">
    <input id="theme-switch" type="checkbox" role="switch" v-model="data.theme" true-value="dark" false-value="light" :hidden="icon">
    <span v-if="icon" for="theme-switch">
      <div class="theme-switch-icon contrast"></div>
    </span>&nbsp;
    <slot></slot>
  </label>`,
  setup() {
    const data = Vue.reactive({
      theme: null
    })

    function toggle(n) {
      data.theme = n
      localStorage.theme = data.theme
      document.documentElement.setAttribute('data-theme', data.theme)
    }

    function load() {
      data.theme = localStorage.theme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      document.documentElement.setAttribute('data-theme', data.theme)
    }

    Vue.watch(() => data.theme, toggle)

    Vue.onMounted(load)

    return { data, toggle }
  }
}

export const NavBar = {
  props: {
    breakpoint: {
      type: String,
      default: 'md'
    },
    menuLabel: {
      type: String,
      default: 'Menu'
    }
  },
  template: `<nav :class="['nav-bar',breakpoint]">
    <ul>
      <li>
        <slot name="brand"></slot>
      </li>
    </ul>
    <ul class="desktop-menu">
      <slot name="menu"></slot>
    </ul>
    <ul class="mobile-menu">
      <li>
        <details role="list" dir="rtl">
          <summary aria-haspopup="listbox" role="link" class="menu-btn">
            <svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="1.2rem" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </summary>
          <ul role="listbox" dir="ltr">
            <slot name="menu"></slot>
          </ul>
        </details>
      </li>
    </ul>
  </nav>`
}

export const Tab = {
  props: {
    title: String
  },
  template: `<div class="tab-content" v-if="title == activeTab">
    <slot></slot>
  </div>`,
  setup() {
    const activeTab = Vue.inject('activeTab')
    return { activeTab }
  }
}

export const Tabs = {
  props: {
    activeTab: String,
    stretch: Boolean
  },
  template: `<article :class="['tabs',{stretch}]">
    <header>
      <ul>
        <li v-for="tabBtn in tabBtns" :key="tabBtn.title" @click="activeTab = tabBtn.title" :class="['tab-btn',{active:activeTab == tabBtn.title}]" role="button" :disabled="tabBtn.disabled">
          {{ tabBtn.title }}
        </li>
      </ul>
    </header>
    <slot></slot>
  </article>`,
  setup(_props, { slots }) {
    const tabBtns = Vue.ref(slots.default().map(t => t.props))
    const activeTab = Vue.ref(tabBtns.value[0].title)

    Vue.provide('activeTab', activeTab)

    return { activeTab, tabBtns }
  }
}

const sheet = new CSSStyleSheet()
sheet.replaceSync(`table thead .column {
  display: flex;
  align-items: center;
}
table thead .column-label {
  flex-grow: 1;
}
table thead .column-label.active {
  font-weight: bold;
}
table thead .column-filter {
  flex-shrink: 1;
  margin-bottom: 0;
  margin-right: .5rem;
  border-width: 1px !important;
}
table thead .sorter {
  display: inline-block;
  text-align: center;
}
table thead .sort:before {
  cursor: pointer;
  display:block;
  content: var(--icon-chevron);
  margin: 0;
}
table thead .sort.desc:before {
  margin-top: -8px;
}
table thead .sort.asc:before {
  transform: rotate(180deg);
  margin-bottom: -8px;
}
table thead .sort:hover:before,
table thead .sort.active:before {
  content: var(--icon-chevron);
}
figure:has(table).bordered {
  border: 1px solid var(--table-border-color);
  border-radius: var(--border-radius);
}
figure.bordered table {
  margin-bottom: 0;
}
.compact:where(input:not([type=checkbox],[type=radio],[type=range])) {
  padding: calc(0.75 * var(--form-element-spacing-vertical)) calc(0.75 * var(--form-element-spacing-horizontal)) !important;
  height: calc(0.5rem * var(--line-height) + var(--form-element-spacing-vertical) * 1.75 + var(--border-width) * 1.75) !important;
}
dialog.wide article {
  width: 100%;
}
dialog article header .close {
  cursor: pointer;
}
dialog article {
  padding-bottom: 1rem;
}
dialog article header {
  margin-bottom: 1rem;
}
dialog article form {
  margin-bottom: 0;
}
.row {
  display: flex;
  flex-wrap: wrap;
  gap: .75rem;
}
.row>* {
  width: auto;
  flex: 1;
}
[role=alert]:empty {
  display: none;
}
[role=alert]:not(:empty) {
  display: block;
  padding: var(--form-element-spacing-vertical) var(--form-element-spacing-horizontal);
  border-radius: var(--border-radius);
  border: 1px solid rgba(0,0,0,.25);
  margin-bottom: var(--spacing);
  background: var(--secondary);
  font-weight: bold;
  color: rgba(255,255,255,.85);
}
[role=alert].success {
  background: #65ab68;
}
[role=alert].info {
  background: #24c5c5;
}
[role=alert].warning {
  background: #ffeb59;
  color: rgba(0,0,0,.65);
}
[role=alert].error {
  background: #d73737;
}
.theme-switch-wrap {
  display: inline-block;
  border-bottom: none !important;
  cursor: pointer;
}
.theme-switch-icon {
  display: inline-block;
}
.theme-switch-icon:after {
  color: var(--contrast);
  display: inline-block;
  width: 1rem;
  height: 1rem;
  position: relative;
  top: 0.1rem;
  border: 0.15rem solid currentColor;
  border-radius: 50%;
  background: linear-gradient(to right,currentColor 0,currentColor 50%,transparent 50%);
  content: '';
  transition: transform var(--transition);
  vertitcal-align: middle;
}
.theme-switch-wrap:hover .theme-switch-icon::after {
  transform: rotate(180deg);
}
.tabs header {
  padding-bottom: 0;
  border-bottom: 1px solid var(--muted-border-color);
}
.tabs header ul {
  display: flex;
  justify-content: flex-start;
  gap: .5em;
  margin-bottom: 0;
  padding: 0;
}
.tabs.stretch header ul .tab-btn {
  flex: 1;
  text-align: center;
}
.tabs header ul .tab-btn {
  display: inline-block;
  list-style-type: none;
  cursor: pointer;
  padding: 1em;
  margin-bottom: calc(var(--font-size) - 1.07em);
  border-top-right-radius: var(--border-radius);
  border-top-left-radius: var(--border-radius);
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
  background: var(--secondary-focus);
  border: 1px solid var(--muted-border-color);
}
.tabs header .tab-btn.active {
  background: var(--card-background-color);
  border-bottom-color: var(--card-background-color);
}
.tabs .tab-content {
  overflow: auto;
}
.nav-bar .menu-btn {
  align-items: center;
  padding: .65rem;
}
.nav-bar .menu-btn:after {
  display: none;
}

@media(max-width:575px) {
  .nav-bar.sm .desktop-menu {
    display: none;
  }
  .nav-bar.sm .mobile-menu {
    display: inherit;
  }
}
@media(min-width:576px) {
  .nav-bar.sm .desktop-menu {
    display: inherit;
  }
  .nav-bar.sm .mobile-menu {
    display: none;
  }
}

@media(max-width:767px) {
  .nav-bar.md .desktop-menu {
    display: none;
  }
  .nav-bar.md .mobile-menu {
    display: inherit;
  }
}
@media(min-width:768px) {
  .nav-bar.md .desktop-menu {
    display: inherit;
  }
  .nav-bar.md .mobile-menu {
    display: none;
  }
}

@media(max-width:991px) {
  .nav-bar.lg .desktop-menu {
    display: none;
  }
  .nav-bar.lg .mobile-menu {
    display: inherit;
  }
}
@media(min-width:992px) {
  .nav-bar.lg .desktop-menu {
    display: inherit;
  }
  .nav-bar.lg .mobile-menu {
    display: none;
  }
}

@media(max-width:1199px) {
  .nav-bar.xl .desktop-menu {
    display: none;
  }
  .nav-bar.xl .mobile-menu {
    display: inherit;
  }
}
@media(min-width:1200px) {
  .nav-bar.xl .desktop-menu {
    display: inherit;
  }
  .nav-bar.xl .mobile-menu {
    display: none;
  }
}`)
document.adoptedStyleSheets = [sheet]
