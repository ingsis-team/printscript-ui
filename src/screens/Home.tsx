import {withNavbar} from "../components/navbar/withNavbar.tsx";
import {SnippetTable} from "../components/snippet-table/SnippetTable.tsx";
import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {SnippetDetail} from "./SnippetDetail.tsx";
import {Drawer} from "@mui/material";
import {useGetSnippets} from "../utils/queries.tsx";
import {usePaginationContext} from "../contexts/paginationContext.tsx";
import useDebounce from "../hooks/useDebounce.ts";
import Login from "../components/login/Login.tsx";
import {useAuth0} from "@auth0/auth0-react";


type RelationshipFilter = 'all' | 'author' | 'shared';
type SortField = 'name' | 'language' | 'validity' | 'author';
type SortDirection = 'asc' | 'desc';

const HomeScreen = () => {
    const {id: paramsId} = useParams<{ id: string }>();
    const [searchTerm, setSearchTerm] = useState('');
    const [snippetName, setSnippetName] = useState('');
    const [snippetId, setSnippetId] = useState<string | null>(null)
    const [relationshipFilter, setRelationshipFilter] = useState<RelationshipFilter>('all');
    const [languageFilter, setLanguageFilter] = useState<string>('all');
    const [validityFilter, setValidityFilter] = useState<string>('all');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const {page, page_size, count, handleChangeCount} = usePaginationContext()
    const { data, isLoading } = useGetSnippets(page, page_size, snippetName);
    const { isAuthenticated, isLoading: authLoading, getAccessTokenSilently, user } = useAuth0()

    useEffect(() => {
        if (isAuthenticated) {
            getAccessTokenSilently()
                .then((token) => {localStorage.setItem('token', token)})
                .catch((error) => {console.error("Error al obtener el token:", error)})
        }
    }, [isAuthenticated]);

  useEffect(() => {
    if (data?.count && data.count != count) {
      handleChangeCount(data.count)
    }
  }, [count, data?.count, handleChangeCount]);


  useEffect(() => {
    if (paramsId) {
      setSnippetId(paramsId);
    }
  }, [paramsId]);

  const handleCloseModal = () => setSnippetId(null)

  // DeBounce Function
  useDebounce(() => {
        setSnippetName(
            searchTerm
        );
      }, [searchTerm], 800
  );

  const handleSearchSnippet = (snippetName: string) => {
    setSearchTerm(snippetName);
  };

  // Filter and sort snippets
  const filteredAndSortedSnippets = data?.content ? [...data.content]
    .filter(snippet => {
      // Filter by relationship
      if (relationshipFilter === 'author') {
        if (snippet.author !== user?.email) return false;
      } else if (relationshipFilter === 'shared') {
        if (snippet.author === user?.email) return false;
      }
      // relationshipFilter === 'all' shows all

      // Filter by language
      if (languageFilter !== 'all' && snippet.language !== languageFilter) {
        return false;
      }

      // Filter by validity
      if (validityFilter !== 'all') {
        const isValid = snippet.compliance === 'compliant';
        if (validityFilter === 'valid' && !isValid) return false;
        if (validityFilter === 'invalid' && isValid) return false;
      }

      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'language':
          comparison = a.language.localeCompare(b.language);
          break;
        case 'validity':
          const aValid = a.compliance === 'compliant' ? 1 : 0;
          const bValid = b.compliance === 'compliant' ? 1 : 0;
          comparison = aValid - bValid;
          break;
        case 'author':
          comparison = a.author.localeCompare(b.author);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    }) : [];

  if(authLoading){
      return <div>Cargando...</div>
  } else if (isAuthenticated){
      return(
          <>
              <SnippetTable 
                loading={isLoading} 
                handleClickSnippet={setSnippetId} 
                snippets={filteredAndSortedSnippets}
                handleSearchSnippet={handleSearchSnippet}
                relationshipFilter={relationshipFilter}
                onRelationshipFilterChange={setRelationshipFilter}
                languageFilter={languageFilter}
                onLanguageFilterChange={setLanguageFilter}
                validityFilter={validityFilter}
                onValidityFilterChange={setValidityFilter}
                sortField={sortField}
                sortDirection={sortDirection}
                onSortChange={(field: SortField) => {
                  if (sortField === field) {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortField(field);
                    setSortDirection('asc');
                  }
                }}
              />
              <Drawer open={!!snippetId} anchor={"right"} onClose={handleCloseModal}>
                  {snippetId && <SnippetDetail handleCloseModal={handleCloseModal} id={snippetId}/>}
              </Drawer>
          </>
      )
  } else {
      return (
        <Login/>
      )
  }
}

export default withNavbar(HomeScreen);