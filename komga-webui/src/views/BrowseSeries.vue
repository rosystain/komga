<template>
  <div>
    <toolbar-sticky v-if="selectedBooks.length === 0">
      <!--   Go back to parent library   -->
      <v-btn icon
             :title="$t('common.go_to_library')"
             :to="{name:'browse-libraries', params: {libraryId: series.libraryId ? series.libraryId : 0 }}"
      >
        <v-icon v-if="$vuetify.rtl">mdi-arrow-right</v-icon>
        <v-icon v-else>mdi-arrow-left</v-icon>
      </v-btn>

      <series-actions-menu v-if="series"
                           :series="series"
      />

      <v-toolbar-title>
        <span v-if="$_.get(series, 'metadata.title')">{{ series.metadata.title }}</span>
        <v-chip label class="mx-4" v-if="totalElements">
          <span style="font-size: 1.1rem">{{ totalElements }}</span>
        </v-chip>
      </v-toolbar-title>

      <v-spacer/>

      <v-btn icon @click="editSeries" v-if="isAdmin">
        <v-icon>mdi-pencil</v-icon>
      </v-btn>

      <page-size-select v-model="pageSize"/>

      <v-btn icon @click="drawer = !drawer">
        <v-icon :color="sortOrFilterActive ? 'secondary' : ''">mdi-filter-variant</v-icon>
      </v-btn>
    </toolbar-sticky>

    <books-multi-select-bar
      v-model="selectedBooks"
      @unselect-all="selectedBooks = []"
      @mark-read="markSelectedRead"
      @mark-unread="markSelectedUnread"
      @add-to-readlist="addToReadList"
      @edit="editMultipleBooks"
    />

    <filter-drawer v-model="drawer">
      <template v-slot:default>
        <filter-list
          :filters-options="filterOptionsList"
          :filters-active.sync="filters"
        />
      </template>

      <template v-slot:filter>
        <filter-panels
          :filters-options="filterOptionsPanel"
          :filters-active.sync="filters"
        />
      </template>

      <template v-slot:sort>
        <sort-list
          :sort-default="sortDefault"
          :sort-options="sortOptions"
          :sort-active.sync="sortActive"
        />
      </template>
    </filter-drawer>

    <v-container fluid>
      <v-row>
        <v-col cols="4" sm="4" md="auto" lg="auto" xl="auto">
          <item-card
            v-if="series.hasOwnProperty('id')"
            width="212"
            :item="series"
            thumbnail-only
            no-link
            :action-menu="false"
          ></item-card>

        </v-col>
        <v-col cols="8" v-if="series.metadata">
          <v-row>
            <v-col>
              <div class="text-h5" v-if="$_.get(series, 'metadata.title')">{{ series.metadata.title }}</div>
            </v-col>
          </v-row>

          <v-row class="text-body-2">
            <v-col>
              <v-chip
                  label
                  small
                  link
                  :color="statusChip.color"
                  :text-color="statusChip.text"
                  :to="{name:'browse-libraries', params: {libraryId: series.libraryId ? series.libraryId : 0 }, query: {status: series.metadata.status}}"
              >
                {{ $t(`enums.series_status.${series.metadata.status}`) }}
              </v-chip>
              <v-chip
                  label
                  small
                  link
                  v-if="series.metadata.ageRating"
                  :to="{name:'browse-libraries', params: {libraryId: series.libraryId ? series.libraryId : 0 }, query: {ageRating: series.metadata.ageRating}}"
                  class="mx-1"
              >
                {{series.metadata.ageRating}}+
              </v-chip>
              <v-chip
                  label
                  small
                  link
                  :to="{name:'browse-libraries', params: {libraryId: series.libraryId ? series.libraryId : 0 }, query: {language: series.metadata.language}}"
                  v-if="series.metadata.language"
                  class="mx-1"
              >
                {{ languageDisplay }}
              </v-chip>
              <v-chip label small v-if="series.metadata.readingDirection" class="mx-1">{{ $t(`enums.reading_direction.${series.metadata.readingDirection}`) }}</v-chip>
            </v-col>
          </v-row>

          <v-row class="mt-3" v-if="series.metadata.summary">
            <v-col>
              <read-more> {{ series.metadata.summary }}</read-more>
            </v-col>
          </v-row>

          <v-row class="mt-3" v-if="!series.metadata.summary && series.booksMetadata.summary">
            <v-col>
              <v-tooltip right>
                <template v-slot:activator="{ on }">
                  <span v-on="on" class="text-caption">
                    {{ $t('browse_series.summary_from_book',{number: series.booksMetadata.summaryNumber})}}
                  </span>
                </template>
                {{ $t('browse_series.series_no_summary') }}
              </v-tooltip>
              <read-more>{{ series.booksMetadata.summary }}</read-more>
            </v-col>
          </v-row>

          <v-row v-if="series.booksMetadata.releaseDate">
            <v-col cols="6" sm="4" md="3" class="text-body-2 py-1 text-uppercase">{{ $t('common.year') }}</v-col>
            <v-col class="text-body-2 text-capitalize py-1">
              <v-tooltip right>
                <template v-slot:activator="{ on }">
                  <span v-on="on">{{ series.booksMetadata.releaseDate | moment('YYYY') }}</span>
                </template>
                {{ $t('browse_series.earliest_year_from_release_dates') }}
              </v-tooltip>
            </v-col>
          </v-row>

          <v-row v-if="series.metadata.publisher">
            <v-col cols="6" sm="4" md="3" class="text-body-2 py-1 text-uppercase">{{ $t('common.publisher') }}</v-col>
            <v-col class="text-body-2 text-capitalize py-1">
              <v-chip
                      :class="$vuetify.rtl ? 'ml-2' : 'mr-2'"
                      :title="series.metadata.publisher"
                      :to="{name:'browse-libraries', params: {libraryId: series.libraryId ? series.libraryId : 0 }, query: {publisher: series.metadata.publisher}}"
                      label
                      small
                      outlined
                      link
              >{{ series.metadata.publisher }}
              </v-chip>
            </v-col>
          </v-row>

          <v-row v-if="series.metadata.genres.length > 0">
            <v-col cols="6" sm="4" md="3" class="text-body-2 py-1 text-uppercase">{{ $t('common.genre') }}</v-col>
            <v-col class="text-body-2 text-capitalize py-1">
              <v-chip v-for="(t, i) in series.metadata.genres"
                      :key="i"
                      :class="$vuetify.rtl ? 'ml-2' : 'mr-2'"
                      :title="t"
                      :to="{name:'browse-libraries', params: {libraryId: series.libraryId ? series.libraryId : 0 }, query: {genre: t}}"
                      label
                      small
                      outlined
                      link
              >{{ t }}
              </v-chip>
            </v-col>
          </v-row>

          <v-row v-if="series.metadata.tags.length > 0">
            <v-col cols="6" sm="4" md="3" class="text-body-2 py-1 text-uppercase">{{ $t('common.tags') }}</v-col>
            <v-col class="text-body-2 text-capitalize py-1">
              <v-chip v-for="(t, i) in series.metadata.tags"
                      :key="i"
                      :class="$vuetify.rtl ? 'ml-2' : 'mr-2'"
                      :title="t"
                      :to="{name:'browse-libraries', params: {libraryId: series.libraryId ? series.libraryId : 0 }, query: {tag: t}}"
                      label
                      small
                      outlined
                      link
              >{{ t }}
              </v-chip>
            </v-col>
          </v-row>

          <v-divider v-if="series.booksMetadata.authors.length > 0"/>

          <v-row class="text-body-2"
                 v-for="(names, key) in authorsByRole"
                 :key="key"
          >
            <v-col cols="6" sm="4" md="3" class="py-1 text-uppercase">{{ key }}</v-col>
            <v-col class="py-1 text-truncate" :title="names.join(', ')">
              {{ names.join(', ') }}
            </v-col>
          </v-row>

          <v-row v-if="$vuetify.breakpoint.name !== 'xs'">
            <v-col>
              <collections-expansion-panels :collections="collections"/>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <v-row v-if="$vuetify.breakpoint.name === 'xs'">
        <v-col class="pt-0 py-1">
          <collections-expansion-panels :collections="collections"/>
        </v-col>
      </v-row>

      <v-divider class="my-1"/>

      <empty-state
        v-if="totalPages === 0"
        :title="$t('common.filter_no_matches')"
        :sub-title="$t('common.use_filter_panel_to_change_filter')"
        icon="mdi-book-multiple"
        icon-color="secondary"
      >
      </empty-state>

      <template v-else>
        <v-pagination
          v-if="totalPages > 1"
          v-model="page"
          :total-visible="paginationVisible"
          :length="totalPages"
        />

        <item-browser :items="books"
                      :selected.sync="selectedBooks"
                      :edit-function="editSingleBook"
        />

        <v-pagination
          v-if="totalPages > 1"
          v-model="page"
          :total-visible="paginationVisible"
          :length="totalPages"
        />
      </template>

    </v-container>

  </div>
</template>

<script lang="ts">
import BooksMultiSelectBar from '@/components/bars/BooksMultiSelectBar.vue'
import ToolbarSticky from '@/components/bars/ToolbarSticky.vue'
import CollectionsExpansionPanels from '@/components/CollectionsExpansionPanels.vue'
import EmptyState from '@/components/EmptyState.vue'
import ItemBrowser from '@/components/ItemBrowser.vue'
import ItemCard from '@/components/ItemCard.vue'
import SeriesActionsMenu from '@/components/menus/SeriesActionsMenu.vue'
import PageSizeSelect from '@/components/PageSizeSelect.vue'
import {parseQueryFilter, parseQuerySort} from '@/functions/query-params'
import {seriesThumbnailUrl} from '@/functions/urls'
import {ReadStatus} from '@/types/enum-books'
import {BOOK_CHANGED, LIBRARY_DELETED, READLIST_CHANGED, SERIES_CHANGED} from '@/types/events'
import Vue from 'vue'
import {Location} from 'vue-router'
import {BookDto} from '@/types/komga-books'
import {SeriesStatus} from '@/types/enum-series'
import FilterDrawer from '@/components/FilterDrawer.vue'
import FilterList from '@/components/FilterList.vue'
import SortList from '@/components/SortList.vue'
import {mergeFilterParams, sortOrFilterActive, toNameValue} from '@/functions/filter'
import FilterPanels from '@/components/FilterPanels.vue'
import {SeriesDto} from "@/types/komga-series";
import {groupAuthorsByRolePlural} from "@/functions/authors";
import ReadMore from "@/components/ReadMore.vue";

const tags = require('language-tags')

const cookiePageSize = 'pagesize'

export default Vue.extend({
  name: 'BrowseSeries',
  components: {
    ToolbarSticky,
    ItemBrowser,
    PageSizeSelect,
    SeriesActionsMenu,
    ItemCard,
    EmptyState,
    BooksMultiSelectBar,
    CollectionsExpansionPanels,
    FilterDrawer,
    FilterList,
    FilterPanels,
    SortList,
    ReadMore,
  },
  data: function () {
    return {
      series: {} as SeriesDto,
      books: [] as BookDto[],
      selectedBooks: [] as BookDto[],
      page: 1,
      pageSize: 20,
      totalPages: 1,
      totalElements: null as number | null,
      sortActive: {} as SortActive,
      sortDefault: {key: 'metadata.numberSort', order: 'asc'} as SortActive,
      filters: {
        readStatus: [],
        tag: [],
      } as FiltersActive,
      sortUnwatch: null as any,
      filterUnwatch: null as any,
      pageUnwatch: null as any,
      pageSizeUnwatch: null as any,
      collections: [] as CollectionDto[],
      drawer: false,
      filterOptions: {
        tag: [] as NameValue[],
      },
    }
  },
  computed: {
    sortOptions(): SortOption[] {
      return [
        {name: this.$t('sort.number').toString(), key: 'metadata.numberSort'},
        {name: this.$t('sort.date_added').toString(), key: 'createdDate'},
        {name: this.$t('sort.release_date').toString(), key: 'metadata.releaseDate'},
        {name: this.$t('sort.file_size').toString(), key: 'fileSize'},
        {name: this.$t('sort.file_name').toString(), key: 'name'},
      ] as SortOption[]
    },
    filterOptionsList(): FiltersOptions {
      return {
        readStatus: {values: [{name: this.$t('filter.unread').toString(), value: ReadStatus.UNREAD}]},
      } as FiltersOptions
    },
    filterOptionsPanel(): FiltersOptions {
      return {
        tag: {name: this.$t('filter.tag').toString(), values: this.filterOptions.tag},
      } as FiltersOptions
    },
    isAdmin(): boolean {
      return this.$store.getters.meAdmin
    },
    thumbnailUrl(): string {
      return seriesThumbnailUrl(this.seriesId)
    },
    paginationVisible(): number {
      switch (this.$vuetify.breakpoint.name) {
        case 'xs':
          return 5
        case 'sm':
        case 'md':
          return 10
        case 'lg':
        case 'xl':
        default:
          return 15
      }
    },
    languageDisplay(): string {
      return tags(this.series.metadata.language).language().descriptions()[0]
    },
    statusChip(): object {
      switch (this.series.metadata.status) {
        case SeriesStatus.ABANDONED:
          return {color: 'red darken-4', text: 'white'}
        case SeriesStatus.ENDED:
          return {color: 'green darken-4', text: 'white'}
        case SeriesStatus.HIATUS:
          return {color: 'orange darken-4', text: 'white'}
      }
      return {color: undefined, text: undefined}
    },
    sortOrFilterActive(): boolean {
      return sortOrFilterActive(this.sortActive, this.sortDefault, this.filters)
    },
    authorsByRole(): any {
      return groupAuthorsByRolePlural(this.series.booksMetadata.authors)
    },
  },
  props: {
    seriesId: {
      type: String,
      required: true,
    },
  },
  watch: {
    series(val) {
      if (this.$_.has(val, 'metadata.title')) {
        document.title = `Komga - ${val.metadata.title}`
      }
    },
  },
  created() {
    this.$eventHub.$on(SERIES_CHANGED, this.reloadSeries)
    this.$eventHub.$on(READLIST_CHANGED, this.reloadSeries)
    this.$eventHub.$on(BOOK_CHANGED, this.reloadBooks)
    this.$eventHub.$on(LIBRARY_DELETED, this.libraryDeleted)
  },
  beforeDestroy() {
    this.$eventHub.$off(SERIES_CHANGED, this.reloadSeries)
    this.$eventHub.$off(READLIST_CHANGED, this.reloadSeries)
    this.$eventHub.$off(BOOK_CHANGED, this.reloadBooks)
    this.$eventHub.$off(LIBRARY_DELETED, this.libraryDeleted)
  },
  async mounted() {
    if (this.$cookies.isKey(cookiePageSize)) {
      this.pageSize = Number(this.$cookies.get(cookiePageSize))
    }

    // restore from query param
    await this.resetParams(this.$route, this.seriesId)
    if (this.$route.query.page) this.page = Number(this.$route.query.page)
    if (this.$route.query.pageSize) this.pageSize = Number(this.$route.query.pageSize)

    this.loadSeries(this.seriesId)

    this.setWatches()
  },
  async beforeRouteUpdate(to, from, next) {
    if (to.params.seriesId !== from.params.seriesId) {
      this.unsetWatches()

      // reset
      await this.resetParams(to, to.params.seriesId)
      this.page = 1
      this.totalPages = 1
      this.totalElements = null
      this.books = []
      this.collections = []
      this.filterOptions.tag = []

      this.loadSeries(to.params.seriesId)

      this.setWatches()
    }

    next()
  },
  methods: {
    async resetParams(route: any, seriesId: string) {
      this.sortActive = this.parseQuerySortOrDefault(route.query.sort)

      // load dynamic filters
      this.filterOptions.tag = toNameValue(await this.$komgaReferential.getTags(undefined, this.seriesId))

      // filter query params with available filter values
      this.filters.readStatus = parseQueryFilter(this.$route.query.readStatus, Object.keys(ReadStatus))
      this.filters.tag = parseQueryFilter(this.$route.query.tag, this.filterOptions.tag.map(x => x.value))
    },
    setWatches() {
      this.sortUnwatch = this.$watch('sortActive', this.updateRouteAndReload)
      this.filterUnwatch = this.$watch('filters', this.updateRouteAndReload)
      this.pageSizeUnwatch = this.$watch('pageSize', (val) => {
        this.$cookies.set(cookiePageSize, val, Infinity)
        this.updateRouteAndReload()
      })

      this.pageUnwatch = this.$watch('page', (val) => {
        this.updateRoute()
        this.loadPage(this.seriesId, val, this.sortActive)
      })
    },
    unsetWatches() {
      this.sortUnwatch()
      this.filterUnwatch()
      this.pageUnwatch()
      this.pageSizeUnwatch()
    },
    updateRouteAndReload() {
      this.unsetWatches()

      this.page = 1

      this.updateRoute()
      this.loadPage(this.seriesId, this.page, this.sortActive)

      this.setWatches()
    },
    libraryDeleted(event: EventLibraryDeleted) {
      if (event.id === this.series.libraryId) {
        this.$router.push({name: 'home'})
      }
    },
    reloadSeries(event: EventSeriesChanged) {
      if (event.id === this.seriesId) this.loadSeries(this.seriesId)
    },
    reloadBooks(event: EventBookChanged) {
      if (event.seriesId === this.seriesId) this.loadSeries(this.seriesId)
    },
    async loadSeries(seriesId: string) {
      this.series = await this.$komgaSeries.getOneSeries(seriesId)
      this.collections = await this.$komgaSeries.getCollections(seriesId)

      await this.loadPage(seriesId, this.page, this.sortActive)
    },
    parseQuerySortOrDefault(querySort: any): SortActive {
      return parseQuerySort(querySort, this.sortOptions) || this.$_.clone(this.sortDefault)
    },
    parseQueryFilterStatus(queryStatus: any): string[] {
      return queryStatus ? queryStatus.toString().split(',').filter((x: string) => Object.keys(ReadStatus).includes(x)) : []
    },
    updateRoute() {
      const loc = {
        name: this.$route.name,
        params: {seriesId: this.$route.params.seriesId},
        query: {
          page: `${this.page}`,
          pageSize: `${this.pageSize}`,
          sort: `${this.sortActive.key},${this.sortActive.order}`,
        },
      } as Location
      mergeFilterParams(this.filters, loc.query)
      this.$router.replace(loc).catch((_: any) => {
      })
    },
    async loadPage(seriesId: string, page: number, sort: SortActive) {
      this.selectedBooks = []

      const pageRequest = {
        page: page - 1,
        size: this.pageSize,
      } as PageRequest

      if (sort) {
        pageRequest.sort = [`${sort.key},${sort.order}`]
      }
      const booksPage = await this.$komgaSeries.getBooks(seriesId, pageRequest, this.filters.readStatus, this.filters.tag)

      this.totalPages = booksPage.totalPages
      this.totalElements = booksPage.totalElements
      this.books = booksPage.content
    },
    analyze() {
      this.$komgaSeries.analyzeSeries(this.series)
    },
    refreshMetadata() {
      this.$komgaSeries.refreshMetadata(this.series)
    },
    editSeries() {
      this.$store.dispatch('dialogUpdateSeries', this.series)
    },
    editSingleBook(book: BookDto) {
      this.$store.dispatch('dialogUpdateBooks', book)
    },
    editMultipleBooks() {
      this.$store.dispatch('dialogUpdateBooks', this.selectedBooks)
    },
    addToReadList() {
      this.$store.dispatch('dialogAddBooksToReadList', this.selectedBooks)
    },
    async markSelectedRead() {
      await Promise.all(this.selectedBooks.map(b =>
        this.$komgaBooks.updateReadProgress(b.id, {completed: true}),
      ))
      await this.loadSeries(this.seriesId)
    },
    async markSelectedUnread() {
      await Promise.all(this.selectedBooks.map(b =>
        this.$komgaBooks.deleteReadProgress(b.id),
      ))
      await this.loadSeries(this.seriesId)
    },
  },
})
</script>

<style scoped>
</style>
