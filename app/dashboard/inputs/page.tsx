"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InputField from "@/components/AppInputFields/InputField";
import { toast } from "sonner";

// Form schema with all input types
const formSchema = z.object({
  // Basic Inputs
  textInput: z.string().min(1, "Text is required"),
  emailInput: z.string().email("Invalid email"),
  passwordInput: z.string().min(6, "Password must be at least 6 characters"),
  numberInput: z.number().min(0, "Must be positive"),
  phoneInput: z.string().optional(),

  // Selection Inputs
  selectInput: z.string().optional(),
  multiSelectInput: z.array(z.string()).optional(),
  radioInput: z.string().optional(),
  yesNoRadio: z.string().optional(),

  // Boolean Inputs
  checkboxInput: z.boolean().optional(),
  switchInput: z.boolean().optional(),

  // Date Inputs
  dateInput: z.string().optional(),
  datetimeInput: z.string().optional(),

  // Text Area
  textAreaInput: z.string().optional(),

  // Other
  colorInput: z.string().optional(),
  ratingInput: z.number().optional(),

  // Special
  editorInput: z.string().optional(),
  aiTextAreaInput: z.string().optional(),
  otpInput: z.string().optional(),
  avatarInput: z.any().optional(),
  modernImageInput: z.any().optional(),
  multiImageInput: z.any().optional(),
  locationInput: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const sampleOptions = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" },
];

export default function InputsPage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      textInput: "",
      emailInput: "",
      passwordInput: "",
      numberInput: 0,
      checkboxInput: false,
      switchInput: false,
      colorInput: "#3B82F6",
    },
  });

  const onSubmit = (data: FormValues) => {
    console.info(data);
    toast.success("Form submitted successfully!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Input Fields Showcase
        </h1>
        <p className="text-muted-foreground">
          All available input field types from AppInputFields component
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="selection">Selection</TabsTrigger>
              <TabsTrigger value="boolean">Boolean</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="special">Special</TabsTrigger>
            </TabsList>

            {/* Basic Inputs */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Input Fields</CardTitle>
                  <CardDescription>
                    Text, Email, Password, Number, Phone
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <InputField
                    name="textInput"
                    label="Text Input"
                    type="text"
                    placeholder="Enter text..."
                    required
                  />

                  <InputField
                    name="emailInput"
                    label="Email Input"
                    type="email"
                    placeholder="your@email.com"
                    required
                  />

                  <InputField
                    name="passwordInput"
                    label="Password Input"
                    type="password"
                    placeholder="Enter password..."
                    required
                  />

                  <InputField
                    name="numberInput"
                    label="Number Input"
                    type="number"
                    placeholder="Enter number..."
                    min={0}
                    max={100}
                    step={1}
                  />

                  <InputField
                    name="phoneInput"
                    label="Phone Input"
                    type="phone"
                    placeholder="+1 (555) 000-0000"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Selection Inputs */}
            <TabsContent value="selection" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Selection Input Fields</CardTitle>
                  <CardDescription>Select, Multi-Select, Radio</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <InputField
                    name="selectInput"
                    label="Select Input"
                    type="select"
                    placeholder="Choose an option..."
                    options={sampleOptions}
                    isSearchable={true}
                  />

                  <InputField
                    name="multiSelectInput"
                    label="Multi-Select Input"
                    type="multiSelect"
                    placeholder="Choose multiple options..."
                    options={sampleOptions}
                  />

                  <InputField
                    name="radioInput"
                    label="Radio Input"
                    type="radio"
                    options={sampleOptions}
                  />

                  <InputField
                    name="yesNoRadio"
                    label="Yes/No Radio"
                    type="yes_no_radio"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Boolean Inputs */}
            <TabsContent value="boolean" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Boolean Input Fields</CardTitle>
                  <CardDescription>Checkbox, Switch</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <InputField
                    name="checkboxInput"
                    label="Checkbox Input"
                    type="checkbox"
                    description="This is a checkbox field"
                  />

                  <InputField
                    name="switchInput"
                    label="Switch Input"
                    type="switch"
                    description="Toggle this switch"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Inputs */}
            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Input Fields</CardTitle>
                  <CardDescription>
                    Date, DateTime, TextArea, Color, Rating
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <InputField
                    name="dateInput"
                    label="Date Input"
                    type="date"
                    placeholder="Select a date..."
                  />

                  <InputField
                    name="datetimeInput"
                    label="DateTime Input"
                    type="datetime-local"
                    placeholder="Select date and time..."
                  />

                  <InputField
                    name="textAreaInput"
                    label="Text Area Input"
                    type="text-area"
                    placeholder="Enter long text..."
                    className="col-span-2"
                  />

                  <InputField
                    name="colorInput"
                    label="Color Picker"
                    type="color-picker"
                    description="Choose a color"
                  />

                  <InputField
                    name="ratingInput"
                    label="Rating Input"
                    type="rating"
                    description="Rate from 1 to 5"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Special Inputs */}
            <TabsContent value="special" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Special Input Fields</CardTitle>
                  <CardDescription>
                    Rich Editor, AI Text Area, OTP, File Uploads
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <InputField
                      name="editorInput"
                      label="Rich Text Editor"
                      type="editor"
                      placeholder="Write something amazing..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <InputField
                      name="aiTextAreaInput"
                      label="AI Text Area"
                      type="ai-text-area"
                      placeholder="Ask AI to help you write..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <InputField
                      name="otpInput"
                      label="One-Time Password (OTP)"
                      type="OTP"
                      description="Enter the 6-digit code"
                    />
                  </div>

                  <InputField
                    name="avatarInput"
                    label="Avatar Upload"
                    type="avatar"
                  />

                  <InputField
                    name="modernImageInput"
                    label="Modern Image Upload"
                    type="modern-image"
                  />

                  <div className="md:col-span-2">
                    <InputField
                      name="multiImageInput"
                      label="Multi-Image Upload"
                      type="multiSelect_images"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <InputField
                      name="locationInput"
                      label="Location Search"
                      type="places_autocomplete"
                      placeholder="Search for a place..."
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Reset
            </Button>
            <Button type="submit">Submit Form</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
