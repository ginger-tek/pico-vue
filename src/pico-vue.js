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

export const Toaster = {
  props: {
    width: {
      type: String,
      default: '350px'
    },
    position: {
      type: String,
      default: 'bottom-left'
    }
  },
  template: `<div :class="['toaster',position]" ref="toaster" :style="{'max-width':width}"></div>`,
  setup() {
    const toaster = Vue.ref(null)
    const fade = 201

    Vue.onMounted(() => {
      window.closeToast = (e) => {
        const el = e.target || e
        el?.classList.remove('show')
        setTimeout(() => el?.remove(), fade)
      }
      window.appendToast = ({ content, dismissAfter = 5, stay = false, type = false }) => {
        const toast = document.createElement('div')
        toast.classList.add('toast', type)
        toast.innerHTML = `<div>${content}</div><span class="close" onclick="closeToast(this.parentElement)"></span>`
        toaster.value.appendChild(toast)
        setTimeout(() => toast.classList.add('show'), 1)
        if (!stay) setTimeout(() => closeToast(toast), dismissAfter * 1000)
      }
    })

    return { toaster }
  }
}

export const ThemeSwitch = {
  props: {
    icon: Boolean
  },
  template: `<label class="theme-switch-wrap">
    <input id="theme-switch" type="checkbox" role="switch" v-model="data.theme" true-value="dark" false-value="light" :hidden="icon">
    <span v-if="icon" for="theme-switch">
      <div class="theme-switch-icon"></div>
    </span>
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
