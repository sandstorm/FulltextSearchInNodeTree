# Fulltext Search in Node Tree

Implements a fulltext search in the Neos node tree (for the Neos React UI), adding a search box before the
normal filtering controls. It uses *Neos Unplanned Extensibility* for the feature.

(requires https://github.com/neos/neos-ui/pull/1385) to be merged in the core

## Search Backends

You can configure the setting `Sandstorm.FulltextSearchInNodeTree.mode` to one of the following backends:

- `nodeSearchIndividualTerms` (default):

  use the NodeSearchService, which uses simple SQL LIKE queries for fulltext search.
  Every whitespace is replaced by "%", i.e. the search string "Welcome Neos" matches "Welcome to Neos".

- `nodeSearchFullString`:

  use the NodeSearchService, which uses simple SQL LIKE queries for the fulltext search.
  Always searches for literal string matches; i.e. when typing "Welcome Neos", it will match "my Welcome Neos Post",
  but NOT "Welcome to Neos"

- `elasticsearch`:

  Use Flowpack.Elasticsearch.ContentRepositoryAdaptor (which needs to be installed and configured separately)
  
  As it uses Elasticsearch under the hood, is also performant with huge data sets; but needs more configuration.

- `simplesearch`:

   Use Flowpack.SimpleSearch.ContentRepositoryAdaptor (which needs to be installed and configured separately)
   Uses sqlite FULLTEXT Index for fulltext indexing. More lightweight than "elasticsearch"; might be faster than
   "nodeSearch*".
