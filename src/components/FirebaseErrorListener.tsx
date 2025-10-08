"use client";

import { useEffect } from "react";
import { errorEmitter } from "@/firebase/error-emitter";
import { useToast } from "@/hooks/use-toast";
import { FirestorePermissionError, FirestoreIndexError } from "@/firebase/errors";

function getErrorMessage(error: FirestorePermissionError): {
  title: string;
  description: string;
} {
  const { operation, path } = error.context;
  const collectionName = path.split("/")[0] || "a document";
  const operationToAction = {
    get: "view",
    list: "view",
    create: "create",
    update: "update",
    delete: "delete",
    write: "write",
  };
  const action = operationToAction[operation] || "access";

  return {
    title: "Permission Denied",
    description: `You do not have permission to ${action} documents in ${collectionName}. Please check your security rules.`,
  };
}

function getIndexErrorMessage(error: FirestoreIndexError): {
  title: string;
  description: string;
} {
  return {
    title: "Database Index Required",
    description: `This query requires a database index. ${error.indexUrl ? `Create it here: ${error.indexUrl}` : 'Please check your Firebase console for the required index.'}`,
  };
}

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      console.error("Firestore Permission Error:", error.toString());
      const { title, description } = getErrorMessage(error);
      toast({
        variant: "destructive",
        title,
        description,
      });

      // For developers, we throw the error in development to show the Next.js overlay
      if (process.env.NODE_ENV === "development") {
        // We need to throw this in a timeout to escape the event emitter's try/catch
        setTimeout(() => {
          throw error;
        });
      }
    };

    const handleIndexError = (error: FirestoreIndexError) => {
      console.error("Firestore Index Error:", error.toString());
      const { title, description } = getIndexErrorMessage(error);
      toast({
        variant: "destructive",
        title,
        description,
      });

      // For developers, we throw the error in development to show the Next.js overlay
      if (process.env.NODE_ENV === "development") {
        // We need to throw this in a timeout to escape the event emitter's try/catch
        setTimeout(() => {
          throw error;
        });
      }
    };

    errorEmitter.on("permission-error", handlePermissionError);
    errorEmitter.on("index-error", handleIndexError);

    return () => {
      errorEmitter.off("permission-error", handlePermissionError);
      errorEmitter.off("index-error", handleIndexError);
    };
  }, [toast]);

  return null;
}
