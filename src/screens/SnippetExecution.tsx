import {Box, Button, CircularProgress, OutlinedInput, Typography} from "@mui/material";
import {highlight, languages} from "prismjs";
import Editor from "react-simple-code-editor";
import {Bòx} from "../components/snippet-table/SnippetBox.tsx";
import {useState} from "react";
import Login from "../components/login/Login.tsx";
import {useAuth0} from "@auth0/auth0-react";
import {RealSnippetOperations} from "../utils/mock/RealSnippetOperations.ts";
import {PlayArrow} from "@mui/icons-material";

const snippetOperations = new RealSnippetOperations();

type SnippetExecutionProps = {
    snippetId?: string;
}

export const SnippetExecution = ({snippetId}: SnippetExecutionProps) => {
  const [input, setInput] = useState<string>("")
  const [inputs, setInputs] = useState<string[]>([]);
  const [output, setOutput] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const {isAuthenticated} = useAuth0();

  const code = output.join("\n")

  const handleEnter = (event: { key: string }) => {
    if (event.key === 'Enter' && input.trim()) {
      setInputs([...inputs, input]);
      setInput("")
    }
  };

  const handleRun = async () => {
    if (!snippetId) return;
    
    setIsExecuting(true);
    setOutput([]);
    setErrors([]);

    try {
      const result = await snippetOperations.executeSnippet(snippetId, inputs);
      setOutput(result.outputs);
      setErrors(result.errors);
    } catch (error: any) {
      setErrors([error.message || 'Execution failed']);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleClear = () => {
    setInputs([]);
    setOutput([]);
    setErrors([]);
    setInput("");
  };

    return (
      isAuthenticated ? <>
        <Box display="flex" flexDirection="column" gap={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <OutlinedInput 
              onKeyDown={handleEnter} 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              placeholder="Type input and press Enter" 
              fullWidth
              disabled={isExecuting}
            />
            <Button 
              variant="contained" 
              onClick={handleRun}
              disabled={!snippetId || isExecuting}
              startIcon={isExecuting ? <CircularProgress size={20} /> : <PlayArrow />}
            >
              Run
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleClear}
              disabled={isExecuting}
            >
              Clear
            </Button>
          </Box>
          
          {inputs.length > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Inputs: {inputs.join(', ')}
              </Typography>
            </Box>
          )}

          {errors.length > 0 && (
            <Box bgcolor="error.main" color="error.contrastText" p={1} borderRadius={1}>
              {errors.map((error, i) => (
                <Typography key={i} variant="body2">{error}</Typography>
              ))}
            </Box>
          )}

          <Bòx flex={1} overflow={"auto"} minHeight={200} maxHeight={400} bgcolor={'black'} color={'white'} code={code}>
              <Editor
                value={code}
                padding={10}
                onValueChange={() => {}}
                highlight={(code) => highlight(code, languages.js, 'javascript')}
                readOnly
                style={{
                    fontFamily: "monospace",
                    fontSize: 17,
                }}
              />
          </Bòx>
        </Box>
      </> : <Login/>
    )
}