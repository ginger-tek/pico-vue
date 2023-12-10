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
    <ul role="listbox">
      <slot></slot>
    </ul>
  </details>`
}

export const DropdownItem = {
  props: {
    href: String
  },
  template: `<li>
    <a :href="href || '#'"><slot></slot></a>
  </li>`
}

export const SmartTable = {
  props: {
    items: Array,
    fields: Array,
    filter: Boolean,
    striped: Boolean,
    emptyText: String,
    emptyFilterText: String
  },
  template: `<table :role="striped ? 'grid' : ''">
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
          {{ emptyFilterText || 'No results' }}
        </td>
      </tr>
      <tr v-else-if="items.length == 0">
        <td :colspan="columns.length" style="text-align:center">
          {{ emptyText || 'No data' }}
        </td>
      </tr>
    </tbody>
  </table>`,
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
        ? props.items.filter(i => filters.map(f => i[f].toLowerCase().indexOf(data.filterCols[f]) > -1).includes(true))
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
  template: `<div class="theme-switch-wrap">
    <input id="theme-switch" type="checkbox" role="switch" v-model="data.theme" true-value="dark" false-value="light" :hidden="icon">
    <label v-if="icon" for="theme-switch">
      <div class="theme-switch-icon contrast"></div>
    </label>
  </div>`,
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
    break: String,
    menuLabel: {
      type: String,
      default: 'Menu'
    }
  },
  components: { ThemeSwitch, Dropdown },
  template: `<nav>
    <ul>
      <li>
        <slot name="brand"></slot>
      </li>
    </ul>
    <ul class="desktop-menu">
      <slot name="menu"></slot>
      <li>
        <theme-switch icon></theme-switch>
      </li>
    </ul>
    <ul class="mobile-menu">
      <li>
        <dropdown class="secondary" role="link" :label="menuLabel" dir="rtl" aria-label="Menu">
          <slot name="menu"></slot>
        </dropdown>
      </li>
      <li>
        <theme-switch icon></theme-switch>
      </li>
    </ul>
  </nav>`
}

export const Tabs = {
  props: {
    active: String,
    stretch: Boolean
  },
  template: `<article :class="['tabs',{stretch}]">
    <header>
      <label v-for="t in data.tabs" :key="t.name" :class="['tab-btn',{active:t.name == data.active}]">
        <input type="radio" v-model="data.active" :value="t.name" hidden>
        {{ t.name }}
      </label>
    </header>
    <template v-for="t in data.tabs" :key="t.name">
      <div v-if="t.name == data.active" class="tab-content" v-html="t.content"></div>
    </template>
  </article>`,
  setup(props, { slots }) {
    const data = Vue.reactive({
      active: props.active || null,
      tabs: slots.default().map(c => ({
        name: c.props.name,
        content: c.children
      }))
    })

    if (!data.active) data.active = data.tabs[0].name

    return { data }
  }
}

export const Loader = {
  props: {
    size: String
  },
  template: `<div aria-busy="true" :style="{'font-size':size || 'inherit'}"></div>`
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
.compact:where(input:not([type=checkbox],[type=radio],[type=range]),select,textarea) {
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
  box-shadow: var(--box-shadow);
  margin-bottom: var(--spacing);
  background: #039be5;
  color: #fff;
}
[role=alert].success {
  background: #43a047;
}
[role=alert].warning {
  background: #fdd835;
  color: #000;
}
[role=alert].error {
  background: #e53935;
}
.theme-switch-wrap {
  display: inline-block;
  border-bottom: none !important;
}
.theme-switch-wrap[data-tooltip] {
  cursor: pointer;
}
.theme-switch-icon:after {
  color: var(--contrast);
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 0.15rem solid currentColor;
  border-radius: 50%;
  background: linear-gradient(to right,currentColor 0,currentColor 50%,transparent 50%);
  content: '';
  transition: transform var(--transition);
  vertitcal-align: middle;
}
.theme-switch-icon:hover::after {
  transform: rotate(180deg);
}
.tabs header {
  display: flex;
  justify-content: flex-start;
  gap: .5em;
  border-bottom: 1px solid var(--muted-border-color);
}
.tabs.stretch header .tab-btn {
  flex: 1;
  text-align: center;
}
.tabs header .tab-btn {
  cursor: pointer;
  padding: 1em;
  margin-bottom: -1em;
  border-top-right-radius: var(--border-radius);
  border-top-left-radius: var(--border-radius);
  bottom: -6px;
  position: relative;
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
@media(max-width:601px) {
  nav .desktop-menu {
    display: none;
  }
  nav .mobile-menu {
    display: inherit;
  }
}
@media(min-width:600px) {
  nav .desktop-menu {
    display: inherit;
  }
  nav .mobile-menu {
    display: none;
  }
}`)
document.adoptedStyleSheets = [sheet]
