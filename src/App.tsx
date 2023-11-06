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
      width: 500,
      height: 500,
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
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const artboardRef = useRef<fabric.Rect | null>(null);

  useEffect(() => {
    canvasRef.current = new fabric.Canvas("canvas", {
      // create a canvas with clientWidth and clientHeight
      width: window.innerWidth - 600,
      height: window.innerHeight - 65,
      backgroundColor: "#e9ecef",
    });

    return () => {
      canvasRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    // Create a new artboard in the center of the canvas when selected artboard changes
    if (selectedArtboard) {
      const artboard = new fabric.Rect({
        left: (window.innerWidth - 600) / 2 - selectedArtboard.width / 2,
        top: (window.innerHeight - 65) / 2 - selectedArtboard.height / 2,
        width: selectedArtboard.width,
        height: selectedArtboard.height,
        fill: "#fff",
        strokeWidth: 1,
        selectable: false,
      });
      canvasRef.current?.add(artboard);
      artboardRef.current = artboard;

      // Load state if it exists
      if (selectedArtboard.state) {
        canvasRef.current?.loadFromJSON(selectedArtboard.state, () => {
          canvasRef.current?.renderAll();
        });
      }
    }
  }, [selectedArtboard]);

  // Update canvas size when viewport size changes
  useEffect(() => {
    const handleResize = () => {
      canvasRef.current?.setDimensions({
        width: window.innerWidth - 600,
        height: window.innerHeight - 65,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [selectedArtboard]);

  const addNewArtboard = (artboard: Omit<Artboard, "id">) => {
    const id = generateId();
    const newArtboard: Artboard = { ...artboard, id };
    setArtboards((current) => [...current, newArtboard]);
    setSelectedArtboard(newArtboard);
    newArtboardForm.reset();
    close();
  };

  const addText = () => {
    if (!selectedArtboard) {
      return;
    }

    if (!artboardRef.current) {
      return;
    }

    const left = artboardRef.current.left;
    const top = artboardRef.current.top;
    const width = artboardRef.current.width;
    const height = artboardRef.current.height;

    if (!left || !top || !width || !height) {
      return;
    }

    // calculate the center of the artboard
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const text = new fabric.IText("Edit me", {
      left: centerX,
      top: centerY,
      fontFamily: "Inter",
      fontSize: 20,
    });

    canvasRef.current?.add(text);
    canvasRef.current?.setActiveObject(text);
    text.enterEditing();
    text.selectAll();
  };

  const updateSelectedArtboard = (artboard: Artboard) => {
    // clear the canvas of selected artboard
    canvasRef.current?.clear();
    const updatedArtboards = artboards.map((item) => {
      if (item.id === artboard.id) {
        return artboard;
      }
      return item;
    });
    setArtboards(updatedArtboards);
    setSelectedArtboard(artboard);
  };

  const exportCurrentArtboard = () => {
    if (!selectedArtboard) {
      return;
    }

    // 1. Load the artboard state into a new offscreen canvas (use fabric.Canvas)
    const newCanvas = document.createElement("canvas");
    newCanvas.width = selectedArtboard.width;
    newCanvas.height = selectedArtboard.height;
    const newFabricCanvas = new fabric.Canvas(newCanvas);

    // 2. Add the artboard state to the new canvas
    newFabricCanvas.loadFromJSON(selectedArtboard.state, () => {
      newFabricCanvas.renderAll();
    });

    // 3. Export the new canvas as a PNG
    const dataURL = newFabricCanvas.toDataURL({
      format: "png",
      multiplier: 1,
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
      selectedArtboard?.width,
      selectedArtboard?.height
    );

    const dataURL = canvasRef.current?.toDataURL({
      format: "png",
      multiplier: multiplier,
      left: artboardRef.current?.left,
      top: artboardRef.current?.top,
      width: artboardRef.current?.width,
      height: artboardRef.current?.height,
    });

    const link = document.createElement("a");
    if (dataURL) {
      link.href = dataURL;
      link.download = "canvas_4k.png";
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const handleZoom = (opt: any) => {
      const delta = opt.e.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.99 ** delta;
      if (zoom > 10) zoom = 10;
      if (zoom < 0.1) zoom = 0.1;
      canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    };

    canvas.on("mouse:wheel", handleZoom);

    return () => {
      canvas.off("mouse:wheel", handleZoom);
    };
  }, []);

  // Handle dragging of canvas with mouse down and alt key pressed
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const handleDrag = (opt: any) => {
      const e = opt.e;
      if (e.altKey === true) {
        setIsDragging(true);
        canvas.selection = false;
        setLastPos({ x: e.clientX, y: e.clientY });
      }
    };

    const handleDragEnd = () => {
      setIsDragging(false);
      canvas.selection = true;
    };

    const handleDragMove = (opt: any) => {
      if (isDragging) {
        const e = opt.e;
        const vpt = canvas.viewportTransform;
        if (!vpt) {
          return;
        }

        vpt[4] += e.clientX - lastPos.x;
        vpt[5] += e.clientY - lastPos.y;
        canvas.requestRenderAll();
        setLastPos({ x: e.clientX, y: e.clientY });
      }
    };

    canvas.on("mouse:down", handleDrag);
    canvas.on("mouse:up", handleDragEnd);
    canvas.on("mouse:move", handleDragMove);

    return () => {
      canvas.off("mouse:down", handleDrag);
      canvas.off("mouse:up", handleDragEnd);
      canvas.off("mouse:move", handleDragMove);
    };
  }, [lastPos.x, lastPos.y, isDragging]);

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
          <canvas id="canvas" />
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
                onClick={exportCurrentArtboard}
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
              placeholder="500"
              required
              classNames={{ label: modalClasses.label }}
              {...newArtboardForm.getInputProps("width")}
            />
            <NumberInput
              label="Height"
              placeholder="500"
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
