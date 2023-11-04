/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ActionIcon,
  Box,
  Button,
  Center,
  Flex,
  Group,
  Modal,
  NumberInput,
  Stack,
  Text,
  TextInput,
  createStyles,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure, useLocalStorage } from "@mantine/hooks";
import {
  IconBadge4k,
  IconDeviceFloppy,
  IconFileExport,
  IconPlus,
} from "@tabler/icons-react";
import { fabric } from "fabric";
import { useEffect, useRef, useState } from "react";

interface Artboard {
  id: string;
  name: string;
  width: number;
  height: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state?: Record<string, any>;
}

const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

function App() {
  const { classes } = useStyles();
  const { classes: modalClasses } = useModalStyles();
  const [opened, { open, close }] = useDisclosure();
  const newArtboardForm = useForm<Omit<Artboard, "id">>({
    initialValues: {
      name: "",
      width: 1000,
      height: 1000,
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (values.name.trim().length === 0) {
        errors.name = "Artboard name cannot be empty";
      }
      if (values.width < 1) {
        errors.width = "Artboard width cannot be less than 1px";
      }
      if (values.height < 1) {
        errors.height = "Artboard height cannot be less than 1px";
      }
      return errors;
    },
  });
  const [artboards, setArtboards] = useLocalStorage<Artboard[]>({
    key: "artboards",
    defaultValue: [],
  });
  const [selectedArtboard, setSelectedArtboard] = useState<Artboard | null>(
    null
  );
  const stageRef = useRef<fabric.Canvas | null>(null);
  const canvasRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    if (!selectedArtboard) {
      return;
    }

    canvasRef.current = new fabric.Canvas(selectedArtboard.id, {
      width: selectedArtboard.width,
      height: selectedArtboard.height,
      backgroundColor: "#fff",
    });
    // Load state from selectedArtboard
    if (selectedArtboard.state) {
      canvasRef.current.loadFromJSON(selectedArtboard.state, () => {
        canvasRef.current?.renderAll();
      });
    }

    return () => {
      canvasRef.current?.dispose();
    };
  }, [selectedArtboard]);

  // Create stage canvas and add all artboards to it
  useEffect(() => {
    stageRef.current = new fabric.Canvas("stage", {
      width: window.innerWidth - 600,
      height: window.innerHeight - 4,
      backgroundColor: "#fff",
    });

    artboards.forEach((artboard) => {
      const canvas = new fabric.Canvas(artboard.id, {
        width: artboard.width,
        height: artboard.height,
      });
      if (artboard.state) {
        canvas.loadFromJSON(artboard.state, () => {
          canvas.renderAll();
        });
      }

      stageRef.current?.add(canvas);
    });

    return () => {
      stageRef.current?.dispose();
    };
  }, [artboards]);

  const addNewArtboard = (artboard: Omit<Artboard, "id">) => {
    const id = generateId();
    const newArtboard: Artboard = { ...artboard, id };
    setArtboards((current) => [...current, newArtboard]);
    setSelectedArtboard(newArtboard);
    newArtboardForm.reset();
    close();
  };

  const addText = () => {
    const text = new fabric.IText("Edit me", {
      left: 50,
      top: 50,
      fontFamily: "Inter",
      fontSize: 20,
    });

    canvasRef.current?.add(text);
    canvasRef.current?.setActiveObject(text);
    text.enterEditing();
    text.selectAll();
  };

  const updateSelectedArtboard = (artboard: Artboard) => {
    const updatedArtboards = artboards.map((item) => {
      if (item.id === artboard.id) {
        return artboard;
      }
      return item;
    });
    setArtboards(updatedArtboards);
    setSelectedArtboard(artboard);
  };

  const exportCurrentCanvas = () => {
    if (!selectedArtboard) {
      return;
    }

    const dataURL = canvasRef.current?.toDataURL({
      format: "png",
      quality: 4,
    });
    const link = document.createElement("a");
    if (dataURL) {
      link.href = dataURL;
      link.download = "canvas.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const export4K = () => {
    const multiplier = getMultiplierFor4K(
      canvasRef.current?.getWidth(),
      canvasRef.current?.getHeight()
    );

    const dataURL = canvasRef.current?.toDataURL({
      format: "png",
      multiplier: multiplier,
    });

    const link = document.createElement("a");
    if (dataURL) {
      link.href = dataURL;
      link.download = "canvas.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getMultiplierFor4K = (width?: number, height?: number): number => {
    // Assuming the canvas is not already 4K, calculate the multiplier needed
    // to scale the current canvas size up to 4K resolution
    const maxWidth = 3840; // for UHD 4K width
    const maxHeight = 2160; // for UHD 4K height
    const widthMultiplier = maxWidth / (width || 1);
    const heightMultiplier = maxHeight / (height || 1);

    // Use the smaller multiplier to ensure the entire canvas fits into the 4K resolution
    return Math.min(widthMultiplier, heightMultiplier);
  };

  const saveArtboardChanges = () => {
    if (!selectedArtboard) {
      return;
    }

    const json = canvasRef.current?.toJSON();
    console.log("Saving artboard changes", json);
    const updatedArtboards = artboards.map((item) => {
      if (item.id === selectedArtboard.id) {
        return {
          ...item,
          state: json,
        };
      }
      return item;
    });
    setArtboards(updatedArtboards);
  };

  return (
    <Box className={classes.root}>
      <Box className={classes.header}>
        <Text className={classes.logo}>Phoenix Editor</Text>
        <Group>
          <ActionIcon
            color="violet"
            variant="subtle"
            onClick={saveArtboardChanges}
          >
            <IconDeviceFloppy size={20} />
          </ActionIcon>
          <Button size="xs" leftIcon={<IconPlus size={12} />} onClick={open}>
            New artboard
          </Button>
        </Group>
      </Box>
      <Flex className={classes.shell}>
        <Box className={classes.left}>
          <Stack spacing={0}>
            {artboards.map((artboard) => (
              <Group
                key={artboard.id}
                className={classes.artboardButton}
                onClick={() => updateSelectedArtboard(artboard)}
              >
                <Text size={14}>{artboard.name}</Text>
                <Text size={12} color="gray">
                  {artboard.width}x{artboard.height}
                </Text>
              </Group>
            ))}
          </Stack>
        </Box>
        <Center className={classes.center}>
          <canvas id="stage">
            <canvas id={selectedArtboard?.id} />
          </canvas>
        </Center>
        <Box className={classes.right}>
          <Stack spacing={16}>
            <Stack spacing={8}>
              <Text size={"sm"} weight={600} color="gray">
                Text
              </Text>
              <Button
                size="xs"
                leftIcon={<IconPlus size={12} />}
                onClick={addText}
              >
                Add text
              </Button>
            </Stack>
            <Stack spacing={4}>
              <Text size={"sm"} weight={600} color="gray">
                Export
              </Text>
              <Button
                size="xs"
                leftIcon={<IconFileExport size={14} />}
                variant="light"
                onClick={exportCurrentCanvas}
              >
                Export as PNG
              </Button>
              <Button
                size="xs"
                leftIcon={<IconBadge4k size={14} />}
                variant="light"
                onClick={export4K}
              >
                Export in 4k
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Flex>
      <Modal
        opened={opened}
        onClose={() => {
          newArtboardForm.reset();
          close();
        }}
        title="Create new artboard"
        classNames={{
          content: modalClasses.content,
          title: modalClasses.title,
        }}
      >
        <Stack spacing={"lg"}>
          <TextInput
            label="Artboard name"
            placeholder="Untitled artboard"
            required
            classNames={{ label: modalClasses.label }}
            {...newArtboardForm.getInputProps("name")}
          />
          <Group grow>
            <NumberInput
              label="Width"
              placeholder="1000"
              required
              classNames={{ label: modalClasses.label }}
              {...newArtboardForm.getInputProps("width")}
            />
            <NumberInput
              label="Height"
              placeholder="1000"
              required
              classNames={{ label: modalClasses.label }}
              {...newArtboardForm.getInputProps("height")}
            />
          </Group>
          <Button
            variant="light"
            size="sm"
            fullWidth
            mt={"md"}
            onClick={() => addNewArtboard(newArtboardForm.values)}
          >
            Create
          </Button>
        </Stack>
      </Modal>
    </Box>
  );
}

export default App;

const useStyles = createStyles((theme) => ({
  root: {
    backgroundColor: theme.colors.gray[2],
    width: "100vw",
    height: "100vh",
  },
  header: {
    borderBottom: `1px solid ${theme.colors.gray[3]}`,
    backgroundColor: theme.colors.gray[0],
    padding: "1rem 3rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    fontSize: theme.fontSizes.xl,
    fontWeight: 700,
    color: theme.colors.violet[7],
  },
  // Create a system where the left and the right panels are on top of the center
  shell: {
    height: "calc(100vh - 4rem)",
    position: "relative",
  },
  left: {
    backgroundColor: theme.colors.gray[0],
    borderRight: `1px solid ${theme.colors.gray[3]}`,
    width: 300,
    height: "100%",
    zIndex: 1,
    position: "absolute",
    left: 0,
  },
  right: {
    backgroundColor: theme.colors.gray[0],
    borderLeft: `1px solid ${theme.colors.gray[3]}`,
    zIndex: 1,
    position: "absolute",
    right: 0,
    width: 300,
    height: "100%",
    padding: "1rem",
  },
  center: {
    backgroundColor: theme.colors.gray[2],
    borderLeft: `1px solid ${theme.colors.gray[3]}`,
    borderRight: `1px solid ${theme.colors.gray[3]}`,
    flexGrow: 1,
    zIndex: 0,
  },
  artboardButton: {
    cursor: "pointer",
    backgroundColor: theme.colors.gray[0],
    border: `1px solid ${theme.colors.gray[3]}`,
    padding: "0.5rem 1rem",
    transition: "background-color 100ms ease",
    height: 40,
    width: "100%",
    "&:hover": {
      backgroundColor: theme.colors.gray[1],
    },
  },
}));

const useModalStyles = createStyles((theme) => ({
  content: {
    width: 400,
    padding: "1rem 0.5rem",
  },
  title: {
    fontWeight: 700,
    fontSize: 18,
    color: theme.colors.gray[8],
  },
  label: {
    color: theme.colors.gray[7],
    paddingBottom: "0.25rem",
  },
}));
