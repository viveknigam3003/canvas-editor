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
  IconBug,
  IconDeviceFloppy,
  IconDownload,
  IconEye,
  IconEyeOff,
  IconFileDownload,
  IconHeading,
  IconPhoto,
  IconPlus,
} from "@tabler/icons-react";
import axios from "axios";
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
  const [showSidebar, setShowSidebar] = useState(true);
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
  const imageForm = useForm<{ url: string }>({
    initialValues: {
      url: "",
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (values.url.trim().length === 0) {
        errors.url = "Image url cannot be empty";
      }
      return errors;
    },
  });
  const [imageModalOpened, { open: openImageModal, close: closeImageModal }] =
    useDisclosure();

  const [artboards, setArtboards] = useLocalStorage<Artboard[]>({
    key: "artboards",
    defaultValue: [],
  });
  const [selectedArtboard, setSelectedArtboard] = useState<Artboard | null>(
    null
  );
  const [isDownloading, setIsDownloading] = useState(false);
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const artboardRef = useRef<fabric.Rect | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    canvasRef.current = new fabric.Canvas("canvas", {
      // create a canvas with clientWidth and clientHeight
      width: window.innerWidth - 600,
      height: window.innerHeight - 60,
      backgroundColor: "#e9ecef",
      imageSmoothingEnabled: false,
    });

    return () => {
      canvasRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (selectedArtboard) {
      // Load state if it exists
      if (selectedArtboard.state) {
        canvasRef.current?.loadFromJSON(selectedArtboard.state, () => {
          canvasRef.current?.renderAll();
          // change artboard ref
          const artboard = canvasRef.current
            ?.getObjects()
            .find((item) => item.data.type === "artboard");
          if (artboard) {
            artboardRef.current = artboard as fabric.Rect;
          }
        });
      }
    }
  }, [selectedArtboard]);

  // Update canvas size when viewport size changes
  useEffect(() => {
    const handleResize = () => {
      canvasRef.current?.setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 60,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const addNewArtboard = (artboard: Omit<Artboard, "id">) => {
    const validationResult = newArtboardForm.validate();
    if (validationResult.hasErrors) {
      console.log("Errors in new artboard form", validationResult.errors);
      return;
    }
    const id = generateId();
    const newArtboard: Artboard = { ...artboard, id };
    setSelectedArtboard(newArtboard);

    canvasRef.current?.clear();
    const artboardRect = new fabric.Rect({
      left: (window.innerWidth - 600) / 2 - artboard.width / 2,
      top: (window.innerHeight - 60) / 2 - artboard.height / 2,
      width: artboard.width,
      height: artboard.height,
      fill: "#fff",
      selectable: false,
      data: {
        type: "artboard",
        id,
      },
    });

    canvasRef.current?.add(artboardRect);
    artboardRef.current = artboardRect;
    // Save the state of the canvas
    const json = canvasRef.current?.toJSON(["data", "selectable"]);
    console.log("Saving new artboard state", json);
    const updatedArtboards = [
      ...artboards,
      {
        ...newArtboard,
        state: json,
      },
    ];
    setArtboards(updatedArtboards);
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

    const text = new fabric.Textbox("Edit this text", {
      left: centerX,
      top: centerY,
      fontFamily: "Inter",
      fontSize: 20,
      width: width / 10,
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

  const exportAllArtboards = async () => {
    try {
      // Download all artboards as zip from backend
      setIsDownloading(true);
      const res = await axios.post(
        "http://localhost:5000/api/download",
        { artboards, origin: window.location.origin },
        {
          responseType: "blob",
        }
      );

      if (!res.data) {
        throw new Error("Response data is undefined");
      }

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "artboards.zip");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsDownloading(false);
    }
  };

  const exportArtboard = () => {
    const artboardLeftAdjustment = canvasRef.current
      ?.getObjects()
      .find((item) => item.data.type === "artboard")?.left;
    const artboardTopAdjustment = canvasRef.current
      ?.getObjects()
      .find((item) => item.data.type === "artboard")?.top;

    if (!artboardLeftAdjustment || !artboardTopAdjustment) {
      return;
    }

    // Now we need to create a new canvas and add the artboard to it
    const offscreenCanvas = new fabric.Canvas("print", {
      width: artboardRef.current?.width,
      height: artboardRef.current?.height,
    });

    const stateJSON = canvasRef.current?.toJSON(["data", "selectable"]);

    const adjustedStateJSONObjects = stateJSON?.objects?.map((item: any) => {
      return {
        ...item,
        left: item.left - artboardLeftAdjustment,
        top: item.top - artboardTopAdjustment,
      };
    });
    const adjustedStateJSON = {
      ...stateJSON,
      objects: adjustedStateJSONObjects,
    };

    offscreenCanvas.loadFromJSON(adjustedStateJSON, () => {
      offscreenCanvas.renderAll();
      console.log(
        "Offscreen canvas = ",
        offscreenCanvas.toJSON(["data", "selectable"])
      );

      const multiplier = getMultiplierFor4K(
        artboardRef.current?.width,
        artboardRef.current?.height
      );

      const config = {
        format: "png",
        multiplier,
      };

      // render the offscreen canvas to a dataURL
      const dataURL = offscreenCanvas.toDataURL(config);

      const link = document.createElement("a");
      if (dataURL) {
        link.href = dataURL;
        link.download = "canvas_4k.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
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

    const json = canvasRef.current?.toJSON(["data", "selectable"]);
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

  const getImageScale = (image: fabric.Image): number => {
    // Calculate the scale needed to fit the image inside the artboard with 20% padding
    const artboardWidth = artboardRef.current?.width;
    const artboardHeight = artboardRef.current?.height;

    console.log("Artboard = ", artboardWidth, artboardHeight);

    if (!artboardWidth || !artboardHeight) {
      return 1;
    }

    const imageWidth = image.width;
    const imageHeight = image.height;

    console.log("Image = ", imageWidth, imageHeight);

    if (!imageWidth || !imageHeight) {
      return 1;
    }

    const widthScale = (artboardWidth * 0.8) / imageWidth;
    const heightScale = (artboardHeight * 0.8) / imageHeight;

    console.log("Width scale = ", widthScale, "Height scale = ", heightScale);

    return Math.min(widthScale, heightScale);
  };

  const addImageFromUrl = (url: string) => {
    const validationResult = imageForm.validate();
    if (validationResult.hasErrors) {
      console.log("Errors in image form= ", validationResult.errors);
      return;
    }
    fabric.Image.fromURL(
      url,
      (img) => {
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

        const scale = getImageScale(img);

        console.log("Scale = ", scale);

        img.set({
          left: centerX,
          top: centerY,
          scaleX: scale,
          scaleY: scale,
        });

        canvasRef.current?.add(img);
        canvasRef.current?.setActiveObject(img);
        imageForm.reset();
        closeImageModal();
      },
      {
        crossOrigin: "anonymous",
      }
    );
  };

  // Handle dragging of canvas with mouse down and alt key pressed
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const handlePan = (opt: any) => {
      // Handle panning based on deltaX and deltaY but prevent zooming
      const e = opt.e;
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const delta = opt.e.deltaY;
        let zoom = canvas.getZoom();
        zoom *= 0.99 ** delta;
        if (zoom > 500) zoom = 500;
        if (zoom < 0.1) zoom = 0.1;
        canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      } else {
        const vpt = canvas.viewportTransform;
        if (!vpt) {
          return;
        }

        vpt[4] -= e.deltaX;
        vpt[5] -= e.deltaY;
        canvas.requestRenderAll();
      }
    }

    canvas.on("mouse:wheel", handlePan);

    return () => {
      canvas.off("mouse:wheel", handlePan);
    };
  }, []);

  const debug = () => {
    console.log(canvasRef.current?.toJSON(["data", "selectable"]));
  };

  return (
    <Box className={classes.root}>
      <Box className={classes.header}>
        <Text className={classes.logo}>Phoenix Editor</Text>
        <Group>
          <ActionIcon
            color="violet"
            variant="subtle"
            onClick={() => {
              setShowSidebar(!showSidebar);
            }}
          >
            {showSidebar ? <IconEye size={20} /> : <IconEyeOff size={20} />}
          </ActionIcon>
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
        {showSidebar ? (
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
        ) : null}
        <Center className={classes.center} ref={canvasContainerRef}>
          <canvas id="canvas" />
        </Center>
        {showSidebar ? (
          <Box className={classes.right}>
            <Stack spacing={16}>
              <Stack spacing={8}>
                <Text size={"sm"} weight={600} color="gray">
                  Debug
                </Text>
                <Button
                  size="xs"
                  leftIcon={<IconBug size={16} />}
                  onClick={debug}
                  variant="outline"
                >
                  Log state
                </Button>
              </Stack>
              <Stack spacing={8}>
                <Text size={"sm"} weight={600} color="gray">
                  Text
                </Text>
                <Button
                  size="xs"
                  leftIcon={<IconHeading size={12} />}
                  onClick={addText}
                >
                  Add text
                </Button>
              </Stack>
              <Stack spacing={8}>
                <Text size={"sm"} weight={600} color="gray">
                  Image
                </Text>
                <Button
                  size="xs"
                  leftIcon={<IconPhoto size={12} />}
                  onClick={openImageModal}
                >
                  Add image from url
                </Button>
              </Stack>
              <Stack spacing={4}>
                <Text size={"sm"} weight={600} color="gray">
                  Export
                </Text>
                <Button
                  size="xs"
                  leftIcon={<IconDownload size={14} />}
                  variant="light"
                  onClick={exportArtboard}
                >
                  Export artboard
                </Button>
                <Button
                  size="xs"
                  leftIcon={<IconFileDownload size={14} />}
                  variant="light"
                  onClick={exportAllArtboards}
                  loading={isDownloading}
                  disabled={window.location.hostname.includes("vercel")}
                >
                  Export all
                </Button>
              </Stack>
            </Stack>
          </Box>
        ) : null}
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
      <Modal
        opened={imageModalOpened}
        onClose={() => {
          imageForm.reset();
          closeImageModal();
        }}
        title={`Add image to ${selectedArtboard?.name}`}
        classNames={{
          content: modalClasses.content,
          title: modalClasses.title,
        }}
      >
        <Stack spacing={"lg"}>
          <TextInput
            label="Image URL"
            placeholder="Enter valid url"
            required
            classNames={{ label: modalClasses.label }}
            {...imageForm.getInputProps("url")}
          />
          <Button
            variant="light"
            size="sm"
            fullWidth
            mt={"md"}
            onClick={() => addImageFromUrl(imageForm.values.url)}
          >
            Add image
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
    flexShrink: 1,
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
