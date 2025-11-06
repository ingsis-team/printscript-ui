import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Select,
  styled,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography
} from "@mui/material";
import {AddSnippetModal} from "./AddSnippetModal.tsx";
import {useRef, useState} from "react";
import {Add, Search, ArrowUpward, ArrowDownward} from "@mui/icons-material";
import {LoadingSnippetRow, SnippetRow} from "./SnippetRow.tsx";
import {CreateSnippetWithLang, getFileLanguage, Snippet} from "../../utils/snippet.ts";
import {usePaginationContext} from "../../contexts/paginationContext.tsx";
import {useSnackbarContext} from "../../contexts/snackbarContext.tsx";
import {useGetFileTypes} from "../../utils/queries.tsx";

type RelationshipFilter = 'all' | 'author' | 'shared';
type SortField = 'name' | 'language' | 'validity' | 'author';
type SortDirection = 'asc' | 'desc';

type SnippetTableProps = {
  handleClickSnippet: (id: string) => void;
  snippets?: Snippet[];
  loading: boolean;
  handleSearchSnippet: (snippetName: string) => void;
  relationshipFilter: RelationshipFilter;
  onRelationshipFilterChange: (filter: RelationshipFilter) => void;
  languageFilter: string;
  onLanguageFilterChange: (filter: string) => void;
  validityFilter: string;
  onValidityFilterChange: (filter: string) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField) => void;
}

export const SnippetTable = (props: SnippetTableProps) => {
  const {
    snippets, 
    handleClickSnippet, 
    loading,
    handleSearchSnippet,
    relationshipFilter,
    onRelationshipFilterChange,
    languageFilter,
    onLanguageFilterChange,
    validityFilter,
    onValidityFilterChange,
    sortField,
    sortDirection,
    onSortChange
  } = props;
  const [addModalOpened, setAddModalOpened] = useState(false);
  const [popoverMenuOpened, setPopoverMenuOpened] = useState(false)
  const [snippet, setSnippet] = useState<CreateSnippetWithLang | undefined>()

  const popoverRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const {page, page_size: pageSize, count, handleChangePageSize, handleGoToPage} = usePaginationContext()
  const {createSnackbar} = useSnackbarContext()
  const {data: fileTypes} = useGetFileTypes();

  // Get unique languages from snippets
  const availableLanguages = Array.from(new Set(snippets?.map(s => s.language) || []));

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />;
  };

  const handleLoadSnippet = async (target: EventTarget & HTMLInputElement) => {
    const files = target.files
    if (!files || !files.length) {
      createSnackbar('error',"Please select at leat one file")
      return
    }
    const file = files[0]
    const splitName = file.name.split(".")
    const fileType = getFileLanguage(fileTypes ?? [], splitName.at(-1))
    if (!fileType) {
      createSnackbar('error', `File type ${splitName.at(-1)} not supported`)
      return
    }
    file.text().then((text) => {
      setSnippet({
        name: splitName[0],
        content: text,
        language: fileType.language,
        extension: fileType.extension
      })
    }).catch(e => {
      console.error(e)
    }).finally(() => {
      setAddModalOpened(true)
      target.value = ""
    })
  }

  function handleClickMenu() {
    setPopoverMenuOpened(false)
  }

  return (
      <>
        <Box display="flex" flexDirection="column" gap={2} mb={2}>
          {/* Search and Add Button Row */}
          <Box display="flex" flexDirection="row" justifyContent="space-between">
            <Box sx={{background: 'white', width: '30%', display: 'flex'}}>
              <InputBase
                  sx={{ml: 1, flex: 1}}
                  placeholder="Search by name"
                  inputProps={{'aria-label': 'search'}}
                  onChange={e => handleSearchSnippet(e.target.value)}
              />
              <IconButton type="button" sx={{p: '10px'}} aria-label="search">
                <Search/>
              </IconButton>
            </Box>
            <Button ref={popoverRef} variant="contained" disableRipple sx={{boxShadow: 0}}
                    onClick={() => setPopoverMenuOpened(true)}>
              <Add/>
              Add Snippet
            </Button>
          </Box>

          {/* Filters Row */}
          <Box display="flex" flexDirection="row" gap={2} alignItems="center">
            <Typography variant="body2" sx={{ minWidth: '80px' }}>Filters:</Typography>
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={relationshipFilter}
                onChange={(e) => onRelationshipFilterChange(e.target.value as RelationshipFilter)}
                displayEmpty
              >
                <MenuItem value="all">All Snippets</MenuItem>
                <MenuItem value="author">My Snippets</MenuItem>
                <MenuItem value="shared">Shared with Me</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={languageFilter}
                onChange={(e) => onLanguageFilterChange(e.target.value)}
                displayEmpty
              >
                <MenuItem value="all">All Languages</MenuItem>
                {availableLanguages.map(lang => (
                  <MenuItem key={lang} value={lang}>{lang}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={validityFilter}
                onChange={(e) => onValidityFilterChange(e.target.value)}
                displayEmpty
              >
                <MenuItem value="all">All Validity</MenuItem>
                <MenuItem value="valid">Valid</MenuItem>
                <MenuItem value="invalid">Invalid</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        <Table size="medium" sx={{borderSpacing: "0 10px", borderCollapse: "separate"}}>
          <TableHead>
            <TableRow sx={{fontWeight: 'bold'}}>
              <StyledTableCell 
                sx={{fontWeight: "bold", cursor: "pointer", userSelect: "none"}}
                onClick={() => onSortChange('name')}
              >
                <Box display="flex" alignItems="center" gap={0.5}>
                  Name {getSortIcon('name')}
                </Box>
              </StyledTableCell>
              <StyledTableCell 
                sx={{fontWeight: "bold", cursor: "pointer", userSelect: "none"}}
                onClick={() => onSortChange('language')}
              >
                <Box display="flex" alignItems="center" gap={0.5}>
                  Language {getSortIcon('language')}
                </Box>
              </StyledTableCell>
              <StyledTableCell 
                sx={{fontWeight: "bold", cursor: "pointer", userSelect: "none"}}
                onClick={() => onSortChange('author')}
              >
                <Box display="flex" alignItems="center" gap={0.5}>
                  Author {getSortIcon('author')}
                </Box>
              </StyledTableCell>
              <StyledTableCell 
                sx={{fontWeight: "bold", cursor: "pointer", userSelect: "none"}}
                onClick={() => onSortChange('validity')}
              >
                <Box display="flex" alignItems="center" gap={0.5}>
                  Validity {getSortIcon('validity')}
                </Box>
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>{
            loading ? (
                <>
                  {Array.from({length: 10}).map((_, index) => (
                      <LoadingSnippetRow key={index}/>
                  ))}
                </>
            ) : (
                <>
                  {
                      snippets && snippets.map((snippet) => (
                          <SnippetRow data-testid={"snippet-row"}
                                      onClick={() => handleClickSnippet(snippet.id)} key={snippet.id} snippet={snippet}/>
                      ))
                  }
                </>
            )
          }
          </TableBody>
          <TablePagination count={count} page={page} rowsPerPage={pageSize}
                           onPageChange={(_, page) => handleGoToPage(page)}
                           onRowsPerPageChange={e => handleChangePageSize(Number(e.target.value))}/>
        </Table>
        <AddSnippetModal defaultSnippet={snippet} open={addModalOpened}
                         onClose={() => setAddModalOpened(false)}/>
        <Menu anchorEl={popoverRef.current} open={popoverMenuOpened} onClick={handleClickMenu}>
          <MenuItem onClick={() => setAddModalOpened(true)}>Create snippet</MenuItem>
          <MenuItem onClick={() => inputRef?.current?.click()}>Load snippet from file</MenuItem>
        </Menu>
        <input hidden type={"file"} ref={inputRef} multiple={false} data-testid={"upload-file-input"}
               onChange={e => handleLoadSnippet(e?.target)}/>
      </>
  )
}


export const StyledTableCell = styled(TableCell)`
    border: 0;
    align-items: center;
`
