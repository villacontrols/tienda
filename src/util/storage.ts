
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';
import * as path from 'path';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(SupabaseService.name);

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL o SUPABASE_KEY no está definido');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.logger.log('SupabaseService inicializado correctamente');
  }

  /**
   * Obtiene el cliente de Supabase para operaciones directas
   */
  getClient(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Sube un archivo a Supabase Storage
   * @param bucketName Nombre del bucket donde se almacenará
   * @param file Buffer del archivo a subir
   * @param contentType Tipo MIME del archivo (ej. 'image/jpeg')
   * @param fileName Nombre opcional para el archivo (si es null, se genera uno aleatorio)
   * @returns Información del archivo subido o error
   */
  async uploadFile(
    bucketName: string,
    file: Buffer,
    contentType: string,
    fileName?: string,
  ) {
    try {
      this.logger.debug(`Iniciando uploadFile al bucket: "${bucketName}"`);

      // Generar un nombre de archivo único si no se proporciona uno
      let fileNameToUse = fileName;
      if (!fileNameToUse) {
        const extension = this.getExtensionFromMimeType(contentType);
        fileNameToUse = `${crypto.randomUUID()}.${extension}`;
      }

      this.logger.debug(`Nombre del archivo a subir: ${fileNameToUse}`);

      // Intentar la subida directamente
      let uploadResult = await this.supabase.storage
        .from(bucketName)
        .upload(fileNameToUse, file, {
          contentType,
          upsert: true,
        });

      if (uploadResult.error) {
        // Si el error es porque el bucket no existe, intentamos crearlo
        if (
          uploadResult.error.message?.includes('bucket') &&
          uploadResult.error.message?.includes('not found')
        ) {
          this.logger.warn(
            `Bucket "${bucketName}" no encontrado, intentando crearlo...`,
          );

          const { error: createError } =
            await this.supabase.storage.createBucket(bucketName, {
              public: true,
              fileSizeLimit: 10485760, // 10MB
            });

          if (createError) {
            throw createError;
          }

          // Intentar la subida nuevamente después de crear el bucket
          uploadResult = await this.supabase.storage
            .from(bucketName)
            .upload(fileNameToUse, file, {
              contentType,
              upsert: true,
            });

          if (uploadResult.error) {
            throw uploadResult.error;
          }
        } else {
          throw uploadResult.error;
        }
      }

      // Generar URL pública del archivo
      const { data: urlData } = await this.supabase.storage
        .from(bucketName)
        .getPublicUrl(fileNameToUse);

      return {
        path: uploadResult.data.path,
        publicUrl: urlData.publicUrl,
        fileName: fileNameToUse,
      };
    } catch (error) {
      this.logger.error(
        `Error en Supabase uploadFile: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Elimina un archivo de Supabase Storage
   * @param bucketName Nombre del bucket
   * @param fileName Nombre del archivo a eliminar
   * @returns Resultado de la operación
   */
  async deleteFile(bucketName: string, fileName: string) {
    try {
      if (!fileName) {
        this.logger.warn(
          'Se intentó eliminar un archivo sin proporcionar nombre',
        );
        return null;
      }

      const { data, error } = await this.supabase.storage
        .from(bucketName)
        .remove([fileName]);

      if (error) {
        // Si el error es que el archivo no existe, no propagamos el error
        if (error.message?.includes('Object not found')) {
          this.logger.warn(
            `Archivo "${fileName}" no encontrado en bucket "${bucketName}"`,
          );
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      this.logger.error(
        `Error en Supabase deleteFile: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Obtiene la URL pública de un archivo
   * @param bucketName Nombre del bucket
   * @param fileName Nombre del archivo
   * @returns URL pública del archivo
   */
  getPublicUrl(bucketName: string, fileName: string) {
    try {
      if (!fileName) {
        return null;
      }

      const { data } = this.supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      this.logger.error(
        `Error en Supabase getPublicUrl: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Obtiene la extensión de archivo basada en el tipo MIME
   * @param mimeType Tipo MIME del archivo
   * @returns Extensión del archivo
   */
  private getExtensionFromMimeType(mimeType: string): string {
    const mimeTypeMap = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'application/pdf': 'pdf',
    };

    return mimeTypeMap[mimeType] || 'bin';
  }
}
