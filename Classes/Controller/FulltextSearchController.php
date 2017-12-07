<?php
namespace Sandstorm\FulltextSearchInNodeTree\Controller;

/*
 * This file is part of the Neos.Setup package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Neos\ContentRepository\Domain\Model\NodeInterface;
use Neos\Eel\FlowQuery\FlowQuery;
use Neos\Flow\Annotations as Flow;
use Neos\Neos\Domain\Service\NodeSearchService;
use Neos\Neos\Ui\Fusion\Helper\NodeInfoHelper;

/**
 * @Flow\Scope("singleton")
 */
class FulltextSearchController extends \Neos\Flow\Mvc\Controller\ActionController
{
    /**
     * @Flow\Inject
     * @var NodeSearchService
     */
    protected $nodeSearchService;

    /**
     * @Flow\InjectConfiguration(path="mode")
     * @var string
     */
    protected $mode;

    /**
     * @param NodeInterface $site
     * @param string $searchQuery
     */
    public function indexAction(NodeInterface $site, $searchQuery)
    {

        $nodes = $this->findNodes($site, $searchQuery);

        $pageNodes = [];
        foreach ($nodes as $node) {
            /* @var \Neos\ContentRepository\Domain\Model\NodeInterface $parentDocument */
            $parentDocument = (new FlowQuery([$node]))->closest('[instanceof Neos.Neos:Document]')->get(0);
            $pageNodes[$parentDocument->getContextPath()] = $parentDocument;
        }

        $nodeInfoHelper = new NodeInfoHelper();
        $result = $nodeInfoHelper->renderNodesWithParents($pageNodes, $this->getControllerContext());
        return json_encode($result);
    }

    /**
     * @param NodeInterface $site
     * @param string $searchQuery
     * @return array
     */
    protected function findNodes(NodeInterface $site, $searchQuery)
    {

        if ($this->mode === 'nodeSearchIndividualTerms') {
            return $this->nodeSearchService->findByProperties(str_replace(' ', '%', $searchQuery), ['Neos.Neos:Node'], $site->getContext(), $site);
        }
        if ($this->mode === 'nodeSearchFullString') {
            return $this->nodeSearchService->findByProperties($searchQuery, ['Neos.Neos:Node'], $site->getContext(), $site);
        }

        if ($this->mode === 'elasticsearch' || $this->mode === 'simplesearch') {
            $searchHelper =new \Neos\ContentRepository\Search\Eel\SearchHelper();
            return $searchHelper->query($site)->fulltext($searchQuery)->execute();
        }

        throw new \Exception('Search Mode "' . $this->mode . '" not found; only "nodeSearchFullString", "nodeSearchIndividualTerms", "elasticsearch" or "simplesearch" supported.');
    }
}
