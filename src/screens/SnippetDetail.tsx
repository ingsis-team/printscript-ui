import {useEffect, useRef, useState} from "react";
import Editor from "react-simple-code-editor";
import {highlight, languages} from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-okaidia.css";
import {Alert, Box, CircularProgress, IconButton, Tooltip, Typography} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import {
    useUpdateSnippetById
} from "../utils/queries.tsx";
import {useFormatSnippet, useGetSnippetById, useShareSnippet} from "../utils/queries.tsx";
import {Bòx} from "../components/snippet-table/SnippetBox.tsx";
import {BugReport, Delete, Download, Save, Share, UploadFile} from "@mui/icons-material";
import {ShareSnippetModal} from "../components/snippet-detail/ShareSnippetModal.tsx";
import {TestSnippetModal} from "../components/snippet-test/TestSnippetModal.tsx";
import {Snippet} from "../utils/snippet.ts";
import {SnippetExecution} from "./SnippetExecution.tsx";
import ReadMoreIcon from '@mui/icons-material/ReadMore';
import {queryClient} from "../App.tsx";
import {DeleteConfirmationModal} from "../components/snippet-detail/DeleteConfirmationModal.tsx";
import Login from "../components/login/Login.tsx";
import {useAuth0} from "@auth0/auth0-react";
import {useSnackbarContext} from "../contexts/snackbarContext.tsx";

type SnippetDetailProps = {
    id: string;
    handleCloseModal: () => void;
}

const DownloadButton = ({snippet}: { snippet?: Snippet }) => {
    if (!snippet) return null;
    const file = new Blob([snippet.content], {type: 'text/plain'});

    return (
        <Tooltip title={"Download"}>
            <IconButton sx={{
                cursor: "pointer"
            }}>
                <a download={`${snippet.name}.${snippet.extension}`} target="_blank"
                   rel="noreferrer" href={URL.createObjectURL(file)} style={{
                    textDecoration: "none",
                    color: "inherit",
                    display: 'flex',
                    alignItems: 'center',
                }}>
                    <Download/>
                </a>
            </IconButton>
        </Tooltip>
    )
}

export const SnippetDetail = (props: SnippetDetailProps) => {
  const {isAuthenticated} = useAuth0();
  const {id, handleCloseModal} = props;
  const [code, setCode] = useState(
      ""
  );
  const [shareModalOppened, setShareModalOppened] = useState(false)
  const [deleteConfirmationModalOpen, setDeleteConfirmationModalOpen] = useState(false)
  const [testModalOpened, setTestModalOpened] = useState(false);
  const uploadFileRef = useRef<HTMLInputElement>(null);
  const {createSnackbar} = useSnackbarContext();

    const {data: snippet, isLoading} = useGetSnippetById(id);
    const {mutate: shareSnippet, isLoading: loadingShare} = useShareSnippet()
    const {mutate: formatSnippet, isLoading: isFormatLoading, data: formatSnippetData} = useFormatSnippet(snippet?.id ?? "", snippet?.language ?? "")
    const {mutate: updateSnippet, isLoading: isUpdateSnippetLoading} = useUpdateSnippetById({
        onSuccess: () => {
            queryClient.invalidateQueries(['snippet', id])
            createSnackbar('success', 'Snippet updated successfully!')
        },
        onError: (error: Error) => {
            // Handle different types of errors
            const errorMessage = error.message || 'Failed to update snippet'
            if (errorMessage.includes('syntax') || errorMessage.includes('sintaxis')) {
                createSnackbar('error', `Syntax validation failed: ${errorMessage}`)
            } else if (errorMessage.includes('permission')) {
                createSnackbar('error', 'You do not have permission to update this snippet')
            } else if (errorMessage.includes('empty') || errorMessage.includes('vacío')) {
                createSnackbar('error', 'File cannot be empty')
            } else {
                createSnackbar('error', errorMessage)
            }
        }
    })

    useEffect(() => {
        if (snippet) {
            setCode(snippet.content);
        }
    }, [snippet]);

    useEffect(() => {
        if (formatSnippetData) {
            setCode(formatSnippetData)
        }
    }, [formatSnippetData])

    async function handleShareSnippet(userId: string) {
        shareSnippet({snippetId: id, userId})
    }

    const handleLoadFileForUpdate = async (target: EventTarget & HTMLInputElement) => {
        const files = target.files
        if (!files || !files.length) {
            createSnackbar('error', "Please select a file")
            return
        }
        const file = files[0]
        
        // Validate file extension matches snippet language
        const fileExtension = file.name.split('.').pop()?.toLowerCase()
        const snippetExtension = snippet?.extension?.toLowerCase()
        
        if (fileExtension && snippetExtension && fileExtension !== snippetExtension) {
            createSnackbar('warning', `File extension .${fileExtension} doesn't match snippet extension .${snippetExtension}. Proceeding anyway.`)
        }
        
        try {
            const text = await file.text()
            if (!text.trim()) {
                createSnackbar('error', 'File is empty')
                return
            }
            setCode(text)
            createSnackbar('success', 'File loaded successfully. Click Save to apply changes.')
        } catch (e) {
            console.error(e)
            createSnackbar('error', 'Error loading file')
        } finally {
            target.value = ""
        }
    }

  return (
      isAuthenticated ? <Box p={4} minWidth={'60vw'}>
        <Box width={'100%'} p={2} display={'flex'} justifyContent={'flex-end'}>
          <CloseIcon style={{cursor: "pointer"}} onClick={handleCloseModal}/>
        </Box>
        {
          isLoading ? (<>
            <Typography fontWeight={"bold"} mb={2} variant="h4">Loading...</Typography>
            <CircularProgress/>
          </>) : <>
            <Typography variant="h4" fontWeight={"bold"}>{snippet?.name ?? "Snippet"}</Typography>
            <Box display="flex" flexDirection="row" gap="8px" padding="8px">
              <Tooltip title={"Share"}>
                <IconButton onClick={() => setShareModalOppened(true)}>
                  <Share/>
                </IconButton>
              </Tooltip>
              <Tooltip title={"Test"}>
                <IconButton onClick={() => setTestModalOpened(true)}>
                  <BugReport/>
                </IconButton>
              </Tooltip>
              <DownloadButton snippet={snippet}/>
              {/*<Tooltip title={runSnippet ? "Stop run" : "Run"}>*/}
              {/*  <IconButton onClick={() => setRunSnippet(!runSnippet)}>*/}
              {/*    {runSnippet ? <StopRounded/> : <PlayArrow/>}*/}
              {/*  </IconButton>*/}
              {/*</Tooltip>*/}
              {/* TODO: we can implement a live mode*/}
              <Tooltip title={"Format"}>
                <IconButton onClick={() => formatSnippet(code)} disabled={isFormatLoading}>
                  <ReadMoreIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={"Upload file to update"}>
                <IconButton onClick={() => uploadFileRef?.current?.click()}>
                  <UploadFile />
                </IconButton>
              </Tooltip>
              <Tooltip title={"Save changes"}>
                <IconButton color={"primary"} onClick={() => updateSnippet({id: id, updateSnippet: {content: code}})} disabled={isUpdateSnippetLoading || snippet?.content === code} >
                  <Save />
                </IconButton>
              </Tooltip>
              <Tooltip title={"Delete"}>
                <IconButton onClick={() => setDeleteConfirmationModalOpen(true)} >
                  <Delete color={"error"} />
                </IconButton>
              </Tooltip>
            </Box>
            <Box display={"flex"} gap={2}>
              <Bòx flex={1} height={"fit-content"} overflow={"none"} minHeight={"500px"} bgcolor={'black'} color={'white'} code={code}>
                <Editor
                    value={code}
                    padding={10}
                    onValueChange={(code) => setCode(code)}
                    highlight={(code) => highlight(code, languages.js, "javascript")}
                    maxLength={1000}
                    style={{
                      minHeight: "500px",
                      fontFamily: "monospace",
                      fontSize: 17,
                    }}
                />
              </Bòx>
            </Box>
            <Box pt={1} flex={1} marginTop={2}>
              <Alert severity="info">Output</Alert>
              <SnippetExecution />
            </Box>
          </>
        }
        <ShareSnippetModal loading={loadingShare || isLoading} open={shareModalOppened}
                           onClose={() => setShareModalOppened(false)}
                           onShare={handleShareSnippet}/>
        <TestSnippetModal open={testModalOpened} onClose={() => setTestModalOpened(false)} snippetId={id}/>
        <DeleteConfirmationModal open={deleteConfirmationModalOpen} onClose={() => setDeleteConfirmationModalOpen(false)} id={snippet?.id ?? ""} setCloseDetails={handleCloseModal} />
        <input hidden type={"file"} ref={uploadFileRef} multiple={false}
               onChange={e => handleLoadFileForUpdate(e?.target)}/>
      </Box> : <Login/>
  );
}

