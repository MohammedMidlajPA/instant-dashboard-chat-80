
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FileUpload } from "lucide-react"
import { toast } from "sonner"

interface ContactCsvUploaderProps {
  onSuccess: () => void
  onCancel: () => void
}

export function ContactCsvUploader({ onSuccess, onCancel }: ContactCsvUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first")
      return
    }

    setUploading(true)
    try {
      // TODO: Implement actual CSV upload and processing logic
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate upload
      toast.success("Contacts imported successfully")
      onSuccess()
    } catch (error) {
      toast.error("Failed to import contacts")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label htmlFor="csv-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <FileUpload className="w-8 h-8 mb-2 text-gray-500" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">CSV files only</p>
          </div>
          <Input
            id="csv-upload"
            type="file"
            className="hidden"
            accept=".csv"
            onChange={handleFileChange}
          />
        </label>
      </div>
      
      {file && (
        <p className="text-sm text-gray-500 text-center">
          Selected file: {file.name}
        </p>
      )}
      
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleUpload} disabled={!file || uploading}>
          {uploading ? "Uploading..." : "Upload and Import"}
        </Button>
      </div>
    </div>
  )
}
