import {alpha, Chip, Skeleton, styled, TableRow, TableRowProps} from "@mui/material";
import {StyledTableCell} from "./SnippetTable.tsx";
import {Snippet} from "../../utils/snippet.ts";

const StyledTableRow = styled(TableRow)(({theme}) => ({
  backgroundColor: 'white',
  border: 0,
  height: '75px',
  cursor: 'pointer',
  '& td': {
    borderTop: '2px solid transparent',
    borderBottom: '2px solid transparent',
  },
  '& td:first-of-type': {
    borderLeft: '2px solid transparent',
    borderTopLeftRadius: theme.shape.borderRadius,
    borderBottomLeftRadius: theme.shape.borderRadius,
  },
  '& td:last-of-type': {
    borderRight: '2px solid transparent',
    borderTopRightRadius: theme.shape.borderRadius,
    borderBottomRightRadius: theme.shape.borderRadius,
  },
  '&:hover > td': {
    borderTop: `2px ${theme.palette.primary.light} solid`,
    borderBottom: `2px ${theme.palette.primary.light} solid`,
    backgroundColor: alpha(theme.palette.primary.light, 0.2)
  },
  '&:hover > td:first-of-type': {
    borderLeft: `2px ${theme.palette.primary.light} solid`,
  },
  '&:hover > td:last-of-type': {
    borderRight: `2px ${theme.palette.primary.light} solid`
  },
}));


export const SnippetRow = ({snippet, onClick, ...props}: { snippet: Snippet, onClick: () => void } & TableRowProps) => {
  const isValid = snippet.compliance === 'compliant';
  const getValidityColor = () => {
    switch (snippet.compliance) {
      case 'compliant':
        return 'success';
      case 'not-compliant':
      case 'failed':
        return 'error';
      case 'pending':
      default:
        return 'warning';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  return (
      <StyledTableRow onClick={onClick} sx={{backgroundColor: 'white', border: 0, height: '75px'}} {...props}>
        <StyledTableCell>{snippet.name}</StyledTableCell>
        <StyledTableCell>{snippet.language}</StyledTableCell>
        <StyledTableCell>{formatDate(snippet.created_at)}</StyledTableCell>
        <StyledTableCell>{snippet.author}</StyledTableCell>
        <StyledTableCell>
          <Chip 
            label={isValid ? 'Valid' : snippet.compliance} 
            color={getValidityColor() as 'success' | 'error' | 'warning'}
            size="small"
          />
        </StyledTableCell>
      </StyledTableRow>
  )
}

export const LoadingSnippetRow = () => {
  return (
      <TableRow sx={{height: '75px', padding: 0}}>
        <StyledTableCell colSpan={5} sx={{
          padding: 0
        }}>
          <Skeleton height={"75px"} width={"100%"} variant={"rectangular"}/>
        </StyledTableCell>
      </TableRow>
  )
}
