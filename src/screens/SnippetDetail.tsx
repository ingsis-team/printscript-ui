import {useEffect, useRef, useState} from "react";
import Editor from "react-simple-code-editor";
import {highlight, languages} from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-okaidia.css";
import {Alert, Box, CircularProgress, IconButton, Tooltip, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import {
    useUpdateSnippetById, useRunAllTests, RunAllTestsResponse
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
  const [openResultsModal, setOpenResultsModal] = useState(false);
  const [testResults, setTestResults] = useState<RunAllTestsResponse | null>(null);
  const uploadFileRef = useRef<HTMLInputElement>(null);
  const {createSnackbar} = useSnackbarContext();

    const {data: snippet, isLoading} = useGetSnippetById(id);
    const {mutate: shareSnippet, isLoading: loadingShare} = useShareSnippet({
        onSuccess: () => {
            setShareModalOppened(false)
            createSnackbar('success', 'Snippet shared successfully!')
        },
        onError: (error: Error) => {
            createSnackbar('error', error.message || 'Failed to share snippet')
        }
    })
    const {mutate: formatSnippet, isLoading: isFormatLoading, data: formatSnippetData} = useFormatSnippet({
        onSuccess: () => {
            createSnackbar('success', 'Snippet formatted successfully!')
        },
        onError: (error) => {
            createSnackbar('error', error.message || 'Failed to format snippet')
        }
    })
    const {mutate: updateSnippet, isLoading: isUpdateSnippetLoading} = useUpdateSnippetById({
        onSuccess: () => {
            queryClient.invalidateQueries(['snippet', id])
            createSnackbar('success', 'Snippet updated successfully! Running tests...')
            // Run all tests automatically after updating
            runAllTests({ snippetId: id })
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
    const {mutate: runAllTests, isLoading: loadingTests} = useRunAllTests({
        onSuccess: (data) => {
            setTestResults(data);
            setOpenResultsModal(true);
        },
        onError: (error: Error) => {
            createSnackbar('error', error.message || 'Failed to run tests')
        }
    })

    useEffect(() => {
        if (snippet) {
            setCode(snippet.content);
        }
    }, [snippet]);

    useEffect(() => {
        if (formatSnippetData && typeof formatSnippetData === 'string') {
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
            
            {/* Snippet Metadata */}
            <Box display="flex" flexDirection="column" gap={1} mb={2} p={2} sx={{ backgroundColor: 'rgba(0, 0, 0, 0.02)', borderRadius: 1 }}>
              {snippet?.description && (
                <Typography variant="body1" color="text.secondary">
                  <strong>Description:</strong> {snippet.description}
                </Typography>
              )}
              <Box display="flex" flexDirection="row" gap={2} flexWrap="wrap">
                <Typography variant="body2" color="text.secondary">
                  <strong>Language:</strong> {snippet?.language ?? 'Unknown'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Author:</strong> {snippet?.author ?? 'Unknown'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Status:</strong> 
                  <span style={{ 
                    color: snippet?.compliance === 'compliant' ? 'green' : 
                           snippet?.compliance === 'not-compliant' || snippet?.compliance === 'failed' ? 'red' : 'orange',
                    fontWeight: 'bold',
                    marginLeft: '4px'
                  }}>
                    {snippet?.compliance === 'compliant' ? 'Valid' : 
                     snippet?.compliance === 'not-compliant' ? 'Not Compliant' :
                     snippet?.compliance === 'failed' ? 'Failed' : 'Pending'}
                  </span>
                </Typography>
              </Box>
            </Box>

            {/* Linting Errors Section */}
            {snippet?.compliance && (snippet.compliance === 'not-compliant' || snippet.compliance === 'failed') && (
              <Box mb={2} p={2} sx={{ backgroundColor: 'rgba(211, 47, 47, 0.1)', borderRadius: 1, border: '1px solid rgba(211, 47, 47, 0.3)' }}>
                <Typography variant="h6" color="error" gutterBottom>
                  ⚠️ Linting Issues Detected
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This snippet has failed linting rules. Please review the code and fix the issues.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  <strong>Compliance Status:</strong> {snippet.compliance === 'not-compliant' ? 'Not Compliant' : 'Failed'}
                </Typography>
              </Box>
            )}

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
                <IconButton onClick={() => formatSnippet({ snippetId: snippet?.id ?? "" })} disabled={isFormatLoading}>
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
                    value={code || ""}
                    padding={10}
                    onValueChange={(code) => setCode(code || "")}
                    highlight={(code) => highlight(code || "", languages.js, "javascript")}
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
              <Alert severity="info">Interactive Execution</Alert>
              <SnippetExecution snippetId={id} />
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
        <Dialog open={openResultsModal} onClose={() => setOpenResultsModal(false)} maxWidth="md" fullWidth>
          <DialogTitle>Test Results</DialogTitle>
          <DialogContent>
            {loadingTests ? (
              <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={3}>
                <CircularProgress />
                <Typography variant="body1">Running all tests...</Typography>
              </Box>
            ) : testResults ? (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Summary
                </Typography>
                <Typography variant="body1">
                  Total Tests: <strong>{testResults.total_tests}</strong>
                </Typography>
                <Typography variant="body1" color="success.main">
                  Passed: <strong>{testResults.passed_tests}</strong>
                </Typography>
                {testResults.failed_tests > 0 && (
                  <Typography variant="body1" color="error.main">
                    Failed: <strong>{testResults.failed_tests}</strong>
                  </Typography>
                )}

                {testResults.total_tests === 0 ? (
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                    No tests found for this snippet.
                  </Typography>
                ) : (
                  <Box mt={3}>
                    <Typography variant="h6" gutterBottom>
                      Test Details:
                    </Typography>
                    {testResults.results.map((result, index) => (
                      <Box key={index} mb={2} p={2} sx={{
                        border: '1px solid',
                        borderColor: result.passed ? 'success.main' : 'error.main',
                        borderRadius: 1,
                        backgroundColor: result.passed ? 'rgba(76, 175, 80, 0.1)' : 'rgba(211, 47, 47, 0.1)'
                      }}>
                        <Typography variant="subtitle1" fontWeight="bold" color={result.passed ? 'success.main' : 'error.main'}>
                          {result.passed ? '✅' : '❌'} {result.test_name}
                        </Typography>
                        <Box mt={1}>
                          <Typography variant="body2" color="text.secondary" fontWeight="bold">
                            Expected Outputs:
                          </Typography>
                          <pre style={{ margin: '4px 0', backgroundColor: '#f5f5f5', padding: '8px', borderRadius: '4px', overflow: 'auto' }}>
                            {(result.expected_outputs || []).join(', ') || 'No output'}
                          </pre>
                        </Box>
                        <Box mt={1}>
                          <Typography variant="body2" color="text.secondary" fontWeight="bold">
                            Actual Outputs:
                          </Typography>
                          <pre style={{ margin: '4px 0', backgroundColor: '#f5f5f5', padding: '8px', borderRadius: '4px', overflow: 'auto' }}>
                            {(result.actual_outputs || []).join(', ') || 'No output'}
                          </pre>
                        </Box>
                        {result.errors && result.errors.length > 0 && (
                          <Box mt={1}>
                            <Typography variant="body2" color="error" fontWeight="bold">
                              Errors:
                            </Typography>
                            <pre style={{ margin: '4px 0', backgroundColor: '#ffebee', padding: '8px', borderRadius: '4px', overflow: 'auto' }}>
                              {(result.errors || []).join('\n')}
                            </pre>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            ) : null}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenResultsModal(false)} color="primary" variant="contained">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box> : <Login/>
  );
}
